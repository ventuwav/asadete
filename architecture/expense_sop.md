# Expense Splitting Logic SOP (Layer 1)

## Goal
Reliably extract expense data from the NotebookLM "Asadete" notebook and calculate precise, zero-sum balances for all participants.

## 1. Input Processing (NotebookLM Tool)
- The raw source of truth is conversational text in NotebookLM.
- A deterministic script (`tools/notebook_api.py`) will interface with the Patched NotebookLM client.
- **Safety Constraint:** The prompt sent to NotebookLM must force a strict JSON response matching the `gemini.md` schema.

## 2. Business Logic (The Algorithm)
1. **Total Pool:** $ \Sigma (\text{All Expense Amounts}) $
2. **Participant Count (N):** Total number of unique participants involved in the event.
3. **Per-Person Split:** $ \text{Total Pool} \div N $.
4. **Individual Balance:** $ (\text{Amount Paid by Person}) - (\text{Per-Person Split}) $.
   - *Positive Balance:* Person paid more than their share (The group owes them).
   - *Negative Balance:* Person paid less than their share (They owe the group).
   - *Zero Balance:* Evenly settled.

## 3. Edge Cases
- **Rounding:** All division results must be rounded to exactly 2 decimal places. Remaining cents will be assigned to the event organizer.
- **Missing Data:** If a participant's payment is not explicitly stated, assume $0.00.
