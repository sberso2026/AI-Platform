# EOS 2.16 Production Migration Manifest

Production ledger 144, maximum `20261027233000`. Staging ledger 146, maximum `20261029120000`. Pending count 14. Duplicate pending count 0. Order is the version sort below. No prerequisite inside this set is missing. No filename collision. Production was not migrated. Staging already has these versions, including the EOS 2.16R enrollment table.

Each row is `ADDITIVE_SAFE`, rollback class `FORWARD_FIX_REQUIRED` for the application and `REVERSIBLE` only by dropping the new unused relations before any EOS 2 row is written. Preferred rollback is to keep the tables and restore application deployment `dpl_7EBZUxhkVX7MjR44rYCgkg8odHgB`. No data backfill. No destructive operation on existing tables. Lock class is new-relation only. Old-app compatibility is yes.

| Version | Name | Phase | SHA-256 |
| --- | --- | --- | --- |
| 20261028120000 | eos_2_1_delivery_lifecycle | EOS 2.1 | `ae9021c0883aa1175c58744be484a7c29e972fda108c3ebaf6a7f7b490191ad0` |
| 20261028140000 | eos_2_2_engineering_basis | EOS 2.2 | `37c7ff84a44d8f541ad2d46b9ba4c22572b67dd624966ae6b3188b85c23f67c0` |
| 20261028160000 | eos_2_3_structural_delivery | EOS 2.3 | `256f3a4ac8a0fabfee64ad636257884c72ee2a9532b6888694932baeb4f5e99d` |
| 20261028180000 | eos_2_4_process_delivery | EOS 2.4 | `3ad1b8c6cecd61ab99556abc186cd5f494eb51c0e3780d09786230199f450cd0` |
| 20261028200000 | eos_2_5_mechanical_delivery | EOS 2.5 | `091f639c9b225b16ab8dc55dfa983529297385e81f2b96e91e290d8bb1d96d27` |
| 20261028220000 | eos_2_6_piping_delivery | EOS 2.6 | `994884f6a2128f6da70e273a085b671c759917f98b40c3fb6e54d7077b2c6003` |
| 20261028240000 | eos_2_7_civil_delivery | EOS 2.7 | `2ec6ed6805a84dbfac418a461d90961675bc3f71089912d3f77a032cffb594ee` |
| 20261029000000 | eos_2_8_geotechnical_delivery | EOS 2.8 | `a309da0350a1487775e9ea5b36bfceddb941173f31e01f3c5dedd3a1238046fa` |
| 20261029020000 | eos_2_9_electrical_delivery | EOS 2.9 | `3cdb7bb067bfb15f173cd5f147764040586833fbd23b393c06a0b9b89389c568` |
| 20261029040000 | eos_2_10_instrumentation_control_delivery | EOS 2.10 | `0342bcff8d78fad8680464225656a10bf7878b1e913b2d00f13f354663b69fea` |
| 20261029060000 | eos_2_11_interface_intelligence | EOS 2.11 | `8669c6ec7d61ba94642ec727571d3871c5754a143e297258945e24793dee966b` |
| 20261029080000 | eos_2_12_change_impact_intelligence | EOS 2.12 | `045fec433e080cdad3478f345ec7eea51c3c799f7eb9d55409bab56d6169f1b6` |
| 20261029100000 | eos_2_13_design_freeze_deliverable_governance | EOS 2.13 | `9f27021b5e4e4d4def5f68cc8a2430605ba05d641ced0ae1b060cf797f027350` |
| 20261029120000 | eos_2_16r_rollout_enrollment | EOS 2.16R | `9896c49a648ffe05892caccdb733b82b342006bde618eb73235a058a3a4a5b21` |

Objects are the `engineering_delivery_*`, `engineering_basis_*`, eight discipline delivery families, `engineering_interface_*`, `engineering_change_impact_*`, and `engineering_design_freeze_*` / `engineering_governed_*` tables created by those files. Each enables RLS and adds select/insert policies plus workspace-tenant triggers. The rehearsal created 113 tables, 227 policies, and 126 triggers. Staging column counts for those 113 tables matched the rehearsal. Production has none of the EOS 2.x delivery tables checked in this phase.

Do not edit these files. A change after staging use requires a new additive migration and a new rehearsal.
