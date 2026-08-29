// Cryptographic Decision Audit Chain (SHA-256 Hash Chain) & RTI Governance for Shejpali System
// Ensures complete tamper-proof transparency for water permit allocations (Maji Pauti) & human overrides
// Compliant with Section 4(1)(b) of RTI Act 2005 & Maharashtra Irrigation Act 1976

function sha256Sync(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  const lengthProperty = 'length';
  let i, j;
  let result = '';

  const words = [];
  const asciiBitLength = ascii[lengthProperty] * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  let composite = ascii + '\x80';
  while (composite[lengthProperty] % 64 - 56) composite += '\x00';
  for (i = 0; i < composite[lengthProperty]; i++) {
    j = composite.charCodeAt(i);
    if (j >> 8) return;
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for (j = 0; j < words[lengthProperty];) {
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);

    for (i = 0; i < 64; i++) {
      const i2 = i + j;
      const w15 = w[i - 15], w2 = w[i - 2];

      const a = hash[0], e = hash[4];
      const temp1 = hash[7]
        + (rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = (i < 16) ? w[i] : (
          w[i - 16]
          + (rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10))
        ) | 0
        );
      const temp2 = (rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));

      hash = [(temp1 + temp2) | 0, a, hash[1], hash[2], (hash[3] + temp1) | 0, hash[4], hash[5], hash[6]];
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (j = 3; j + 1; j--) {
      const b = (hash[i] >> (j * 8)) & 255;
      result += ((b < 16) ? 0 : '') + b.toString(16);
    }
  }
  return result;
}

export class AuditLedger {
  constructor() {
    this.chain = [];
    this.initializeGenesisBlock();
  }

  initializeGenesisBlock() {
    const genesisData = {
      message: "Kopargaon Shejpali Water Allocation & Godavari Canal Division Decision Genesis Block",
      statutoryFramework: "Maharashtra Irrigation Act, 1976 & RTI Act, 2005 Sec 4(1)(b)",
      authority: "Government of Maharashtra / Kopargaon Municipal Council",
      canalDivision: "Godavari Left Bank Canal (GLBC) Sub-Division Kopargaon",
      version: "3.0.0-Shejpali-Twin",
      timestamp: "2026-08-29T00:00:00.000Z"
    };

    const block = {
      index: 0,
      timestamp: genesisData.timestamp,
      actionType: "GENESIS_SEAL",
      actor: "CANAL_SUPERINTENDING_ENGINEER",
      data: genesisData,
      justification: "Genesis block initialized with statutory canal quota (140 Cusecs) and Shejpali criteria weights.",
      previousHash: "0000000000000000000000000000000000000000000000000000000000000000",
      hash: ""
    };

    block.hash = this.calculateBlockHash(block);
    this.chain = [block];
  }

  calculateBlockHash(block) {
    const str = `${block.index}${block.timestamp}${block.actionType}${block.actor}${JSON.stringify(block.data)}${block.justification}${block.previousHash}`;
    return sha256Sync(str);
  }

  addBlock(actionType, actor, data, justification) {
    const prevBlock = this.chain[this.chain.length - 1];
    const newIndex = prevBlock.index + 1;
    const timestamp = new Date().toISOString();

    const block = {
      index: newIndex,
      timestamp,
      actionType,
      actor,
      data,
      justification,
      previousHash: prevBlock.hash,
      hash: ""
    };

    block.hash = this.calculateBlockHash(block);
    this.chain.push(block);
    return block;
  }

  verifyChainIntegrity() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      // Check pointer link
      if (current.previousHash !== previous.hash) {
        return { valid: false, brokenIndex: i, reason: "Hash pointer mismatch with previous block" };
      }

      // Check current hash integrity
      const recalculated = this.calculateBlockHash(current);
      if (current.hash !== recalculated) {
        return { valid: false, brokenIndex: i, reason: "Block data was altered after signing" };
      }
    }

    return { valid: true, totalBlocks: this.chain.length };
  }

  simulateTampering(index) {
    if (index > 0 && index < this.chain.length) {
      this.chain[index].justification += " [TAMPERED_DISCHARGE_ALTERATION]";
      return true;
    }
    return false;
  }

  getChain() {
    return [...this.chain];
  }

  generateRTIReport() {
    return {
      reportId: `KMC-SHEJPALI-RTI-${Date.now()}`,
      generatedAt: new Date().toISOString(),
      council: "Kopargaon Municipal Council & Godavari Canal Division (कोपरगाव नगरपरिषद व पाटबंधारे विभाग)",
      statutoryDeclaration: "This audit report is generated from an append-only SHA-256 cryptographic ledger compliant with Section 4(1)(b) of the Right to Information Act, 2005 and Maharashtra Irrigation Act, 1976.",
      blocksCount: this.chain.length,
      integrityStatus: this.verifyChainIntegrity(),
      ledger: this.chain
    };
  }
}
