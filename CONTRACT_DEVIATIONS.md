# Contract Deviations

## Week 6 — Write Endpoints (Claims)

No deviations. The write endpoints (`POST /claims`, `PATCH /claims/{claimId}`,
`DELETE /claims/{claimId}`, `POST /claims/{claimId}/refunds`) were implemented
exactly as defined in `openapi.yaml`. All validation rules, status codes, and
response shapes match the contract as specified.

Testing confirmed:

- Valid requests return the documented success status codes (201/200/204).
- Missing/invalid fields return 400 with a clear error message.
- Operations on nonexistent claims return 404.
