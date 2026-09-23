const express = require('express');
const app = express();
const PORT = 3000;

app.use(express.json());

// ---- In-memory "database" ----
let claims = [
  {
    claimId: 'c1',
    studentId: 's1',
    itemId: 'i1',
    status: 'claimed',
    rewardAmountCents: 1500,
    submittedAt: '2026-07-01T09:15:00Z',
  },
  {
    claimId: 'c2',
    studentId: 's1',
    itemId: 'i2',
    status: 'pending',
    rewardAmountCents: 800,
    submittedAt: '2026-07-03T10:00:00Z',
  },
];

let fees = [
  { claimId: 'c1', studentId: 's1', itemId: 'i1', amountPayableCents: 500 },
];

let refunds = [
  {
    refundId: 'r1',
    claimId: 'c1',
    studentId: 's1',
    amountCents: 250,
    reason: 'Item returned in damaged condition; partial refund issued.',
    refundedAt: '2026-08-20T16:30:00Z',
  },
];

let schools = [
  {
    schoolId: 'sch1',
    schoolName: 'Lakeside High School',
    totalItemsReported: 214,
    totalItemsClaimed: 132,
    totalRewardAmountPaidCents: 198000,
  },
];

let nextClaimId = 3;
let nextRefundId = 2;

// ---- Existing GET routes ----
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/claims', (req, res) => {
  const { status } = req.query;
  const result = claims.filter((c) => c.status === status);
  res.json(result);
});

app.get('/students/:studentId/claims', (req, res) => {
  const { studentId } = req.params;
  const result = claims
    .filter((c) => c.studentId === studentId)
    .map(({ claimId, itemId, status, submittedAt }) => ({
      claimId,
      itemId,
      status,
      submittedAt,
    }));

  if (result.length === 0) {
    return res.status(404).json({ error: 'student not found' });
  }
  res.json(result);
});

app.get('/schools/:schoolId/item-statistics', (req, res) => {
  const school = schools.find((s) => s.schoolId === req.params.schoolId);
  if (!school) {
    return res.status(404).json({ error: 'school not found' });
  }
  res.json(school);
});

app.get('/claims/:claimId/fees', (req, res) => {
  const fee = fees.find((f) => f.claimId === req.params.claimId);
  if (!fee) {
    return res.status(404).json({ error: 'claim not found' });
  }
  res.json(fee);
});

app.get('/claims/:claimId/refunds', (req, res) => {
  const claimExists = claims.find((c) => c.claimId === req.params.claimId);
  if (!claimExists) {
    return res.status(404).json({ error: 'claim not found' });
  }
  const result = refunds.filter((r) => r.claimId === req.params.claimId);
  res.json(result);
});

// ---- NEW: Write routes ----

// POST /claims — submit a new claim
app.post('/claims', (req, res) => {
  const { studentId, itemId } = req.body;

  // Validation first
  if (!studentId || typeof studentId !== 'string') {
    return res
      .status(400)
      .json({ error: 'studentId is required and must be a string' });
  }
  if (!itemId || typeof itemId !== 'string') {
    return res
      .status(400)
      .json({ error: 'itemId is required and must be a string' });
  }

  // Write
  const newClaim = {
    claimId: `c${nextClaimId++}`,
    studentId,
    itemId,
    status: 'pending',
    rewardAmountCents: 0,
    submittedAt: new Date().toISOString(),
  };
  claims.push(newClaim);

  res.status(201).json(newClaim);
});

// PATCH /claims/:claimId — update claim status
app.patch('/claims/:claimId', (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'claimed', 'rejected'];

  // Validation first
  if (!status || typeof status !== 'string') {
    return res
      .status(400)
      .json({ error: 'status is required and must be a string' });
  }
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of: ${validStatuses.join(', ')}` });
  }

  // Existence check
  const claim = claims.find((c) => c.claimId === req.params.claimId);
  if (!claim) {
    return res.status(404).json({ error: 'claim not found' });
  }

  // Write (idempotent — setting absolute state)
  claim.status = status;

  res.status(200).json(claim);
});

// DELETE /claims/:claimId — withdraw a claim
app.delete('/claims/:claimId', (req, res) => {
  const index = claims.findIndex((c) => c.claimId === req.params.claimId);

  if (index === -1) {
    return res.status(404).json({ error: 'claim not found' });
  }

  claims.splice(index, 1);
  res.status(204).send();
});

// POST /claims/:claimId/refunds — issue a refund
app.post('/claims/:claimId/refunds', (req, res) => {
  const { studentId, amountCents, reason } = req.body;

  // Validation first
  if (!studentId || typeof studentId !== 'string') {
    return res
      .status(400)
      .json({ error: 'studentId is required and must be a string' });
  }
  if (typeof amountCents !== 'number' || !Number.isInteger(amountCents)) {
    return res
      .status(400)
      .json({ error: 'amountCents is required and must be an integer' });
  }
  if (!reason || typeof reason !== 'string') {
    return res
      .status(400)
      .json({ error: 'reason is required and must be a string' });
  }

  // Existence check
  const claim = claims.find((c) => c.claimId === req.params.claimId);
  if (!claim) {
    return res.status(404).json({ error: 'claim not found' });
  }

  // Write
  const newRefund = {
    refundId: `r${nextRefundId++}`,
    claimId: req.params.claimId,
    studentId,
    amountCents,
    reason,
    refundedAt: new Date().toISOString(),
  };
  refunds.push(newRefund);

  res.status(201).json(newRefund);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
