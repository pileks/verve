/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/aa_poc.json`.
 */
export type AaPoc = {
  "address": "7UD7pBcVkw2yJQzdm9eNTfeSC8uo2WhM6MdUzBXK48zv",
  "metadata": {
    "name": "aaPoc",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "execInstruction",
      "discriminator": [
        9,
        136,
        217,
        19,
        171,
        251,
        123,
        62
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        }
      ],
      "args": [
        {
          "name": "instructionData",
          "type": "bytes"
        }
      ]
    },
    {
      "name": "initWallet",
      "discriminator": [
        141,
        132,
        233,
        130,
        168,
        183,
        10,
        119
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "payer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "registerKeypair",
      "discriminator": [
        205,
        111,
        146,
        163,
        150,
        128,
        19,
        10
      ],
      "accounts": [
        {
          "name": "wallet",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  119,
                  97,
                  108,
                  108,
                  101,
                  116
                ]
              }
            ]
          }
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        }
      ],
      "args": []
    },
    {
      "name": "testTransaction",
      "discriminator": [
        80,
        140,
        3,
        126,
        171,
        191,
        2,
        55
      ],
      "accounts": [],
      "args": []
    },
    {
      "name": "verifyEcdsa",
      "discriminator": [
        191,
        18,
        177,
        253,
        170,
        211,
        107,
        155
      ],
      "accounts": [],
      "args": [
        {
          "name": "signatureBytes",
          "type": "bytes"
        },
        {
          "name": "recoveryParam",
          "type": "u8"
        },
        {
          "name": "pubkeyBytes",
          "type": "bytes"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "wallet",
      "discriminator": [
        24,
        89,
        59,
        139,
        81,
        154,
        232,
        95
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "controllerMismatch",
      "msg": "Controller mismatch"
    },
    {
      "code": 6001,
      "name": "invalidToken",
      "msg": "Invalid token"
    },
    {
      "code": 6002,
      "name": "invalidAlgorithm",
      "msg": "Invalid algorithm"
    },
    {
      "code": 6003,
      "name": "invalidSignature",
      "msg": "Invalid signature"
    }
  ],
  "types": [
    {
      "name": "wallet",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "controller",
            "type": "pubkey"
          }
        ]
      }
    }
  ]
};
