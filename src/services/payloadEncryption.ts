const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

const ENCRYPTION_ENABLED =
  import.meta.env.VITE_PAYLOAD_ENCRYPTION_ENABLED === 'true';
const ENCRYPTION_SECRET = import.meta.env.VITE_PAYLOAD_ENCRYPTION_KEY ?? '';
const ENCRYPTION_ALGORITHM =
  import.meta.env.VITE_PAYLOAD_ENCRYPTION_ALGORITHM ?? 'aes-256-gcm';
const ENCRYPTION_SEPARATOR =
  import.meta.env.VITE_ENCRYPTED_PAYLOAD_SEPARATOR ?? '.';
const ENCRYPTION_IV_LENGTH = Number(
  import.meta.env.VITE_PAYLOAD_ENCRYPTION_IV_LENGTH ?? '12',
);
const ENCRYPTION_TAG_LENGTH = Number(
  import.meta.env.VITE_PAYLOAD_ENCRYPTION_TAG_LENGTH ?? '16',
);

export interface EncryptedPayloadEnvelope {
  encrypted: true;
  algorithm: string;
  payload: string;
}

interface PayloadContext {
  method: string;
  path: string;
}

let cachedKeyPromise: Promise<CryptoKey> | null = null;

export function isPayloadEncryptionEnabled(): boolean {
  return ENCRYPTION_ENABLED;
}

export function isEncryptedPayloadEnvelope(
  value: unknown,
): value is EncryptedPayloadEnvelope {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }

  const record = value as Record<string, unknown>;
  return (
    record.encrypted === true &&
    typeof record.payload === 'string'
  );
}

export async function encryptPayload(
  value: unknown,
  context: PayloadContext,
): Promise<EncryptedPayloadEnvelope> {
  return createEncryptedPayloadEnvelope(value, context, 'request');
}

export async function encryptResponsePayload(
  value: unknown,
  context: PayloadContext,
): Promise<EncryptedPayloadEnvelope> {
  return createEncryptedPayloadEnvelope(value, context, 'response');
}

async function createEncryptedPayloadEnvelope(
  value: unknown,
  context: PayloadContext,
  direction: 'request' | 'response',
): Promise<EncryptedPayloadEnvelope> {
  const plaintext = textEncoder.encode(JSON.stringify(value));
  const key = await getRequiredKey();
  const iv = crypto.getRandomValues(new Uint8Array(ENCRYPTION_IV_LENGTH));
  const aad = buildAad(context, direction);
  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: toWebCryptoAlgorithmName(ENCRYPTION_ALGORITHM),
      iv,
      additionalData: aad,
      tagLength: ENCRYPTION_TAG_LENGTH * 8,
    },
    key,
    plaintext,
  );
  const encryptedBytes = new Uint8Array(encryptedBuffer);
  const ciphertext = encryptedBytes.slice(0, encryptedBytes.length - ENCRYPTION_TAG_LENGTH);
  const tag = encryptedBytes.slice(encryptedBytes.length - ENCRYPTION_TAG_LENGTH);

  return {
    encrypted: true,
    algorithm: ENCRYPTION_ALGORITHM,
    payload: [iv, tag, ciphertext].map(toBase64Url).join(ENCRYPTION_SEPARATOR),
  };
}

export async function decryptPayload<T>(
  envelope: EncryptedPayloadEnvelope,
  context: PayloadContext,
): Promise<T> {
  return decryptEncryptedPayload(envelope, context, 'response');
}

export async function decryptRequestPayload<T>(
  envelope: EncryptedPayloadEnvelope,
  context: PayloadContext,
): Promise<T> {
  return decryptEncryptedPayload(envelope, context, 'request');
}

async function decryptEncryptedPayload<T>(
  envelope: EncryptedPayloadEnvelope,
  context: PayloadContext,
  direction: 'request' | 'response',
): Promise<T> {
  const [ivSegment, tagSegment, ciphertextSegment] = envelope.payload.split(
    ENCRYPTION_SEPARATOR,
  );

  if (!ivSegment || !tagSegment || !ciphertextSegment) {
    throw new Error('Encrypted payload format is invalid.');
  }

  const iv = fromBase64Url(ivSegment);
  const tag = fromBase64Url(tagSegment);
  const ciphertext = fromBase64Url(ciphertextSegment);

  if (iv.length !== ENCRYPTION_IV_LENGTH || tag.length !== ENCRYPTION_TAG_LENGTH) {
    throw new Error('Encrypted payload metadata is invalid.');
  }

  const key = await getRequiredKey();
  const aad = buildAad(context, direction);
  const merged = new Uint8Array(ciphertext.length + tag.length);
  merged.set(ciphertext, 0);
  merged.set(tag, ciphertext.length);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: toWebCryptoAlgorithmName(import.meta.env.VITE_PAYLOAD_ENCRYPTION_ALGORITHM ?? 'aes-256-gcm'),
      iv,
      additionalData: aad,
      tagLength: tag.length * 8,
    },
    key,
    merged,
  );

  return JSON.parse(textDecoder.decode(decryptedBuffer)) as T;
}

export function buildPayloadContext(method: string, url: string): PayloadContext {
  const parsedUrl = new URL(url, window.location.origin);

  return {
    method: method.toUpperCase(),
    path: parsedUrl.pathname,
  };
}

async function getRequiredKey(): Promise<CryptoKey> {
  if (!ENCRYPTION_ENABLED) {
    throw new Error('Payload encryption is disabled for this environment.');
  }

  if (!ENCRYPTION_SECRET) {
    throw new Error('Payload encryption key is not configured.');
  }

  if (!cachedKeyPromise) {
    cachedKeyPromise = crypto.subtle
      .digest('SHA-256', textEncoder.encode(ENCRYPTION_SECRET))
      .then((digest) =>
        crypto.subtle.importKey(
          'raw',
          digest,
          {
            name: toWebCryptoAlgorithmName(ENCRYPTION_ALGORITHM),
          },
          false,
          ['encrypt', 'decrypt'],
        ),
      );
  }

  return cachedKeyPromise;
}

function buildAad(
  context: PayloadContext,
  direction: 'request' | 'response',
): Uint8Array {
  return textEncoder.encode(
    JSON.stringify({
      direction,
      method: context.method,
      path: context.path,
    }),
  );
}

function toWebCryptoAlgorithmName(algorithm: string): 'AES-GCM' {
  if (algorithm.toLowerCase() !== 'aes-256-gcm') {
    throw new Error(`Unsupported payload encryption algorithm: ${algorithm}`);
  }

  return 'AES-GCM';
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';

  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(
    value.length + ((4 - (value.length % 4)) % 4),
    '=',
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}
