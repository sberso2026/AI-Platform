# Citation contract

Document-based answers expose clickable provenance to `/engineering/documents/{id}?page=&section=&chunk=`.

Minimum citation:

- document title/number
- revision
- page
- section/clause/figure when detected

Example:

```
AS/NZS 1252:1996
Section 3.4, Test Methods
Page N
```

or

```
AS/NZS 1252:1996
Figure 2.3
Tolerance on Straightness of High-Strength Steel Bolts
Page 15
```

Referenced-standard boundary: if document A says test methods shall be as given in AS/NZS 4291.2, Engineering AI may state that fact and must not invent AS/NZS 4291.2 procedures unless that standard is itself authorised and retrievable.
