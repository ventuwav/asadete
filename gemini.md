# 🏛️ PROJECT CONSTITUTION (`gemini.md`)

## 1. DATA SCHEMAS (The Law)
**Event**
```json
{ "id": "UUID", "name": "string", "status": "open|settled|closed", "share_token": "string", "created_at": "timestamp" }
```
**Participant**
```json
{ "id": "UUID", "event_id": "UUID", "name": "string", "alias": "string (nullable)", "participant_token": "string", "created_at": "timestamp" }
```
**Expense**
```json
{ "id": "UUID", "participant_id": "UUID", "event_id": "UUID", "total_amount": "number", "created_at": "timestamp" }
```
**ExpenseItem**
```json
{ "id": "UUID", "expense_id": "UUID", "name": "string", "amount": "number" }
```
**Debt**
```json
{ "id": "UUID", "event_id": "UUID", "from_participant_id": "UUID", "to_participant_id": "UUID", "amount": "number", "status": "pending|paid|confirmed" }
```

## 2. DEBT SETTLEMENT ALGORITHM
```python
Objective: minimize amount of transfers.
debtors = negative balances
creditors = positive balances

while debtors and creditors:
  d = largest debtor
  a = largest creditor
  payment = min(abs(d), a)
  create_debt_record(from: d, to: a, amount: payment)
  subtract payment from d and a balances
  remove d or a if their balance reaches 0
```

## 3. BEHAVIORAL RULES
1. Strict adherence to **"The Serene Republic"** aesthetic.
2. Lightweight sessions via `participant_token` saved in `localStorage`.
3. Never use generic pure black `#000000`.
