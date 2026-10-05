/*
 * One-off P0 runtime security verification. Reads the existing local Firebase
 * browser sessions only to mint short-lived ID tokens; identifiers and tokens
 * are never written to stdout. All created Storage paths are disposable.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const chromeRoot = path.join(process.env.HOME, 'Library/Application Support/Google/Chrome');
const project = 'khushi-ornament-house';
const bucket = 'khushi-ornament-house.firebasestorage.app';
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (!apiKey) {
  throw new Error('NEXT_PUBLIC_FIREBASE_API_KEY is required to run this verification.');
}
const customer = '100omkarnathverma@gmail.com';
const admin = '100abhisheksarraf@gmail.com';
const suffix = `p0-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const customerPath = `products/p0-nonadmin-verification/${suffix}.png`;
const protectedPath = `products/p0-admin-delete-verification/${suffix}.png`;
const tinyPng = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAHElEQVQoz2P4z8DAwMDAwMDwn4GBgYGBgYGBAQAkBgMBOOSShwAAAABJRU5ErkJggg==', 'base64');

function balancedObject(text, start) {
  let depth = 0;
  let quoted = false;
  let escaped = false;
  for (let i = start; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') quoted = false;
    } else if (ch === '"') quoted = true;
    else if (ch === '{') depth += 1;
    else if (ch === '}' && --depth === 0) return text.slice(start, i + 1);
  }
  return null;
}

function sessionUser(profile, email) {
  const dbDir = path.join(chromeRoot, profile, 'IndexedDB', 'https_khushi-ornament-house.vercel.app_0.indexeddb.leveldb');
  const files = fs.readdirSync(dbDir).filter((file) => /\.(ldb|log)$/.test(file));
  for (const file of files) {
    const text = fs.readFileSync(path.join(dbDir, file)).toString('utf8');
    const emailAt = text.indexOf(email);
    if (emailAt < 0) continue;
    // LevelDB log records may omit the outer JSON closing brace while a
    // profile is open. The individual JSON string fields remain intact.
    const record = text.slice(Math.max(0, emailAt - 600), Math.min(text.length, emailAt + 2200));
    const token = record.match(/refreshToken"[^\"]*?([A-Za-z0-9_-]{30,})/);
    const uidMatches = [...record.matchAll(/uid"[^\"]*?([A-Za-z0-9_-]{10,})/g)];
    const uid = uidMatches.at(-1)?.[1];
    if (uid && token?.[1]) return { uid, stsTokenManager: { refreshToken: token[1] } };
  }
  throw new Error(`No persisted Firebase session found for the requested account (${profile}).`);
}

async function idToken(profile, email) {
  const user = sessionUser(profile, email);
  const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${apiKey}`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: user.stsTokenManager.refreshToken }),
  });
  if (!response.ok) throw new Error(`Could not refresh Firebase session (${response.status}).`);
  const data = await response.json();
  return { token: data.id_token, uid: user.uid };
}

function storageUrl(objectPath) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(objectPath)}`;
}

async function upload(token, objectPath) {
  const boundary = `p0-${Math.random().toString(36).slice(2)}`;
  const preamble = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=utf-8\r\n\r\n` +
    JSON.stringify({ name: objectPath, contentType: 'image/png' }) +
    `\r\n--${boundary}\r\nContent-Type: image/png\r\n\r\n`
  );
  const ending = Buffer.from(`\r\n--${boundary}--`);
  return fetch(`https://firebasestorage.googleapis.com/v0/b/${bucket}/o?name=${encodeURIComponent(objectPath)}`, {
    method: 'POST',
    headers: {
      authorization: `Firebase ${token}`,
      'content-type': `multipart/related; boundary=${boundary}`,
      'x-goog-upload-protocol': 'multipart',
    },
    body: Buffer.concat([preamble, tinyPng, ending]),
  });
}

async function remove(token, objectPath) {
  return fetch(storageUrl(objectPath), { method: 'DELETE', headers: { authorization: `Firebase ${token}` } });
}

async function metadata(objectPath) {
  return fetch(storageUrl(objectPath));
}

async function main() {
  const customerSession = await idToken('Profile 4', customer);
  const adminSession = await idToken('Default', admin);
  const adminDocument = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/admins/${encodeURIComponent(customerSession.uid)}`,
    { headers: { authorization: `Bearer ${customerSession.token}` } }
  );
  const cloudToken = execFileSync('gcloud', ['auth', 'print-access-token'], { encoding: 'utf8' }).trim();
  const adminDocumentPrivileged = await fetch(
    `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/admins/${encodeURIComponent(customerSession.uid)}`,
    { headers: { authorization: `Bearer ${cloudToken}` } }
  );

  const uploadResult = await upload(customerSession.token, customerPath);
  const uploadBody = await uploadResult.text();
  const unauthorizedUpload = uploadResult.status === 403 && /unauthorized|permission[_ -]?denied/i.test(uploadBody);
  const uploadObjectAbsent = (await metadata(customerPath)).status === 404;

  if (process.env.P0_SKIP_ADMIN_DELETE_TEST === '1') {
    console.log(JSON.stringify({
      firebaseAuthAccountExists: true,
      adminDocumentAbsent: adminDocumentPrivileged.status === 404,
      adminDocumentStatus: adminDocument.status,
      adminDocumentPrivilegedStatus: adminDocumentPrivileged.status,
      nonAdminUploadDenied: unauthorizedUpload,
      unauthorizedUploadObjectAbsent: uploadObjectAbsent,
      uploadObjectStatus: (await metadata(customerPath)).status,
    }));
    return;
  }

  let adminCreate = null;
  let deniedDelete = false;
  let objectStayed = false;
  let cleanup = false;
  try {
    adminCreate = await upload(adminSession.token, protectedPath);
    if (!adminCreate.ok) throw new Error(`Admin disposable-object creation failed (${adminCreate.status}): ${(await adminCreate.text()).slice(0, 300)}`);
    const denied = await remove(customerSession.token, protectedPath);
    const deniedBody = await denied.text();
    deniedDelete = denied.status === 403 && /unauthorized|permission[_ -]?denied/i.test(deniedBody);
    objectStayed = (await metadata(protectedPath)).status === 200;
  } finally {
    const cleanupResult = await remove(adminSession.token, protectedPath);
    cleanup = cleanupResult.ok || cleanupResult.status === 404;
  }
  const protectedObjectAbsent = (await metadata(protectedPath)).status === 404;

  console.log(JSON.stringify({
    firebaseAuthAccountExists: true,
    adminDocumentAbsent: adminDocument.status === 404,
    nonAdminUploadDenied: unauthorizedUpload,
    unauthorizedUploadObjectAbsent: uploadObjectAbsent,
    nonAdminDeleteDenied: deniedDelete,
    protectedTestObjectRemained: objectStayed,
    adminCleanupCompleted: cleanup && protectedObjectAbsent,
  }));
}

main().catch((error) => {
  console.error(`P0_RUNTIME_CHECK_FAILED: ${error.message}`);
  process.exitCode = 1;
});
