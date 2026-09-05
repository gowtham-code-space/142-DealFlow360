# Strict Google Sign-In & Sign-Up Separation Walkthrough

## Summary of Changes

1. **Google Sign-In Restriction (Sign In Tab)**:
   - When attempting to sign in with Google, the backend searches the database for the user account.
   - If the user does not exist in the database, the server returns a `404 Not Found` response with `notFound: true`.
   - The frontend intercepts this response, triggers a warning toast (*"No account found with this Google email. Please register on the Sign Up tab first."*), and switches to the **Sign Up** tab.

2. **Google Account Creation (Sign Up Tab)**:
   - When registering on the **Sign Up** tab with Google OAuth:
     - If the email belongs to an Admin-provisioned corporate employee (`ADMIN`, `SALES_REP`, `SALES_MANAGER`, `FINANCE_OPS`), registration is rejected (`409 Conflict`), and a toast warning alerts the user to sign in instead.
     - If the user already exists as a customer, a toast alerts them that the account exists and redirects to sign in.
     - If the user does not exist, a new customer record + user record with role `CUSTOMER` is created in the TiDB database.
     - A JWT `accessToken` is issued containing `{ userId, roleId }`, and the user is logged into the Customer Portal with a success toast.
