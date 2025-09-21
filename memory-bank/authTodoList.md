# Supabase Authentication To-Do List

This file tracks the steps required to implement the Supabase authentication login flow. Check off each item as it is completed.

## To-Do List

1. **Install Supabase Client**

   - [x] Install the Supabase client library (`@supabase/supabase-js`).
   - [x] Retrieve the Supabase URL and Anon Key from the Supabase dashboard.
   - [x] Set up environment variables for Supabase (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).

2. **Initialize Supabase**

   - [x] Create a `supabaseClient.ts` file to initialize the Supabase client.
   - [x] Verify the connection to your Supabase project.

3. **Create the Login UI**

   - [x] Create a new `Login.tsx` component.
   - [x] Add a login form with fields for email and password.
   - [x] Add a "Login" button to trigger the authentication process.

4. **Implement Login Logic**

   - [x] Use Supabase's `signInWithPassword` method to authenticate users.
     - [x] Pass the email and password from the login form to the method.
   - [x] Handle success states:
     - [x] Display a success message (e.g., "Login successful!").
   - [x] Handle error states:
     - [x] Display an error message (e.g., "Invalid email or password.").
     - [x] Log the error details for debugging purposes.

5. **Set Up Navigation Flow**

   - [x] Install React Router DOM for navigation.
   - [x] Set up routing in the app using React Router.
   - [ ] Configure css to App.tsx to be more generic so pages can be dynamic
   - [ ] Add Login screen to route and navigation
   - [ ] Create a secure page (e.g., dashboard) for logged-in users.
   - [ ] Redirect users to the secure page after successful login.

6. **Test the Login Flow**

   - [ ] Test the login functionality with valid and invalid credentials.
   - [ ] Verify that the user session is created on successful login.

7. **Add Logout Functionality**

   - [ ] Add a "Logout" button to allow users to sign out.
   - [ ] Use Supabase's `signOut` method to clear the user session.

8. **Secure Routes**

   - [ ] Protect certain routes/pages so they are only accessible to authenticated users.
   - [ ] Redirect unauthenticated users to the login page.

9. **Document the Process**
   - [ ] Update the `progress.md` file to track what has been completed.
   - [ ] Add any new insights or patterns to `systemPatterns.md`.

---

## Notes

- As each step is completed, mark it with `[x]` to indicate progress.
- Refer to the `progress.md` file for a detailed status update on the project.
- Update this file as needed to reflect any changes in the plan.

---

### Example of a Completed Step

```markdown
1. **Install Supabase Client**
   - [x] Install the Supabase client library (`@supabase/supabase-js`).
   - [x] Set up environment variables for Supabase (`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`).
```
