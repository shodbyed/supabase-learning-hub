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
   - [x] Configure css to App.tsx to be more generic so pages can be dynamic
   - [x] Create modular css for index, App, and Navigation
   - [x] Add shadcn and tailwind
   - [x] Add a check to see if user is logged in.
   - [x] Add Login screen to route and navigation
   - [x] Add Register screen to route and navigation
   - [x] Add email confirmation route and auto-login functionality
   - [ ] Create a secure page (e.g., dashboard) for logged-in users.
   - [ ] Redirect users to the secure page after successful login.

6. **Add Registration Functionality**

   - [x] Create Register.tsx component with form validation
   - [x] Implement password confirmation validation
   - [x] Add Supabase user registration with signUp method
   - [x] Create auto-login after email confirmation flow
   - [x] Add navigation links between login and register pages

7. **Test the Authentication Flows**

   - [x] Test the registration functionality with valid and invalid data
   - [x] Test the login functionality with valid and invalid credentials
   - [x] Verify that the user session is created on successful login
   - [x] Test email confirmation and auto-login flow

8. **Add Logout Functionality**

   - [x] Add a "Logout" button to allow users to sign out.
   - [x] Use Supabase's `signOut` method to clear the user session.

9. **Secure Routes**

   - [ ] Protect certain routes/pages so they are only accessible to authenticated users.
   - [ ] Redirect unauthenticated users to the login page.

10. **Document the Process**
   - [x] Update the `progress.md` file to track what has been completed.
   - [x] Add any new insights or patterns to `systemPatterns.md`.

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
