export type CompressedAaPoc = {
  "version": "0.1.0",
  "name": "compressed_aa_poc",
  "instructions": [
    {
      "name": "testTransaction",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initWallet",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "assignGuardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "registerKeypair",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "assignGuardian",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seedGuardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "execInstruction",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seedGuardian",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The actual access check happens using wallet_guardian."
          ]
        },
        {
          "name": "guardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "instructionData",
          "type": "bytes"
        },
        {
          "name": "accountKeys",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "isWritableFlags",
          "type": {
            "vec": "bool"
          }
        },
        {
          "name": "isSignerFlags",
          "type": {
            "vec": "bool"
          }
        }
      ]
    },
    {
      "name": "execInstructionAlt",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seedGuardian",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The actual access check happens using wallet_guardian."
          ]
        },
        {
          "name": "guardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "instructionData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "generateIdlTypesNoop",
      "accounts": [],
      "args": [
        {
          "name": "types",
          "type": {
            "defined": "Types"
          }
        }
      ]
    }
  ],
  "types": [
    {
      "name": "Types",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "walletGuardian",
            "type": {
              "defined": "WalletGuardian"
            }
          },
          {
            "name": "verveInstruction",
            "type": {
              "defined": "VerveInstruction"
            }
          }
        ]
      }
    },
    {
      "name": "VerveInstruction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "bytes"
          },
          {
            "name": "accountIndices",
            "type": "bytes"
          },
          {
            "name": "writableAccounts",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "signerAccounts",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "programAccountIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "WalletGuardian",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "guardian",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "PackedAddressMerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addressMerkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "addressQueuePubkeyIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "PackedMerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "nullifierQueuePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "leafIndex",
            "type": "u32"
          },
          {
            "name": "queueIndex",
            "docs": [
              "Index of leaf in queue. Placeholder of batched Merkle tree updates",
              "currently unimplemented."
            ],
            "type": {
              "option": {
                "defined": "QueueIndex"
              }
            }
          }
        ]
      }
    },
    {
      "name": "QueueIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "queueId",
            "docs": [
              "Id of queue in queue account."
            ],
            "type": "u8"
          },
          {
            "name": "index",
            "docs": [
              "Index of compressed account hash in queue."
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "CompressedProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "b",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "c",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GuardianMismatch",
      "msg": "Guardian mismatch"
    },
    {
      "code": 6001,
      "name": "WalletMismatch",
      "msg": "Wallet mismatch"
    },
    {
      "code": 6002,
      "name": "InvalidGuardianSignature",
      "msg": "Invalid guardian signature"
    }
  ]
};

export const IDL: CompressedAaPoc = {
  "version": "0.1.0",
  "name": "compressed_aa_poc",
  "instructions": [
    {
      "name": "testTransaction",
      "accounts": [
        {
          "name": "signer",
          "isMut": false,
          "isSigner": true
        }
      ],
      "args": []
    },
    {
      "name": "initWallet",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "assignGuardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "registerKeypair",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "assignGuardian",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seedGuardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        }
      ]
    },
    {
      "name": "execInstruction",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seedGuardian",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The actual access check happens using wallet_guardian."
          ]
        },
        {
          "name": "guardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "instructionData",
          "type": "bytes"
        },
        {
          "name": "accountKeys",
          "type": {
            "vec": "publicKey"
          }
        },
        {
          "name": "isWritableFlags",
          "type": {
            "vec": "bool"
          }
        },
        {
          "name": "isSignerFlags",
          "type": {
            "vec": "bool"
          }
        }
      ]
    },
    {
      "name": "execInstructionAlt",
      "accounts": [
        {
          "name": "wallet",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "seedGuardian",
          "isMut": false,
          "isSigner": false,
          "docs": [
            "The actual access check happens using wallet_guardian."
          ]
        },
        {
          "name": "guardian",
          "isMut": false,
          "isSigner": true
        },
        {
          "name": "payer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "selfProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "cpiSigner",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "lightSystemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "registeredProgramPda",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "noopProgram",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "accountCompressionAuthority",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "inputs",
          "type": {
            "vec": "bytes"
          }
        },
        {
          "name": "proof",
          "type": {
            "defined": "CompressedProof"
          }
        },
        {
          "name": "merkleContext",
          "type": {
            "defined": "PackedMerkleContext"
          }
        },
        {
          "name": "merkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "addressMerkleContext",
          "type": {
            "defined": "PackedAddressMerkleContext"
          }
        },
        {
          "name": "addressMerkleTreeRootIndex",
          "type": "u16"
        },
        {
          "name": "instructionData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "generateIdlTypesNoop",
      "accounts": [],
      "args": [
        {
          "name": "types",
          "type": {
            "defined": "Types"
          }
        }
      ]
    }
  ],
  "types": [
    {
      "name": "Types",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "walletGuardian",
            "type": {
              "defined": "WalletGuardian"
            }
          },
          {
            "name": "verveInstruction",
            "type": {
              "defined": "VerveInstruction"
            }
          }
        ]
      }
    },
    {
      "name": "VerveInstruction",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "data",
            "type": "bytes"
          },
          {
            "name": "accountIndices",
            "type": "bytes"
          },
          {
            "name": "writableAccounts",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "signerAccounts",
            "type": {
              "vec": "bool"
            }
          },
          {
            "name": "programAccountIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "WalletGuardian",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "wallet",
            "type": "publicKey"
          },
          {
            "name": "guardian",
            "type": "publicKey"
          }
        ]
      }
    },
    {
      "name": "PackedAddressMerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "addressMerkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "addressQueuePubkeyIndex",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "PackedMerkleContext",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "merkleTreePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "nullifierQueuePubkeyIndex",
            "type": "u8"
          },
          {
            "name": "leafIndex",
            "type": "u32"
          },
          {
            "name": "queueIndex",
            "docs": [
              "Index of leaf in queue. Placeholder of batched Merkle tree updates",
              "currently unimplemented."
            ],
            "type": {
              "option": {
                "defined": "QueueIndex"
              }
            }
          }
        ]
      }
    },
    {
      "name": "QueueIndex",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "queueId",
            "docs": [
              "Id of queue in queue account."
            ],
            "type": "u8"
          },
          {
            "name": "index",
            "docs": [
              "Index of compressed account hash in queue."
            ],
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "CompressedProof",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "a",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "b",
            "type": {
              "array": [
                "u8",
                64
              ]
            }
          },
          {
            "name": "c",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "GuardianMismatch",
      "msg": "Guardian mismatch"
    },
    {
      "code": 6001,
      "name": "WalletMismatch",
      "msg": "Wallet mismatch"
    },
    {
      "code": 6002,
      "name": "InvalidGuardianSignature",
      "msg": "Invalid guardian signature"
    }
  ]
};
