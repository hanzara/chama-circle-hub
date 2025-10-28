# Admin Account Setup

Since we're using Supabase for authentication, you need to create the admin account:

## Step 1: Create Admin User in Supabase Dashboard

1. Go to your [Supabase Authentication page](https://supabase.com/dashboard/project/yeqfmfgzqzvadhuoqxsl/auth/users)
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: `admin@bosombuddynexus.com` (or your preferred admin email)
   - Password: (Set a secure password)
   - User Metadata: Add this JSON:
     ```json
     {
       "username": "Kimera Tuva"
     }
     ```
4. Click "Create user"
5. **Copy the User ID** (UUID) that gets generated

## Step 2: Assign Admin Role

Run this SQL in your [SQL Editor](https://supabase.com/dashboard/project/yeqfmfgzqzvadhuoqxsl/sql/new):

```sql
-- Replace 'USER_ID_HERE' with the actual UUID from Step 1
INSERT INTO public.user_roles (user_id, role)
VALUES ('USER_ID_HERE', 'admin');
```

## Step 3: Email Confirmation

If you have "Confirm email" enabled in Supabase:
- Go to [Auth Providers settings](https://supabase.com/dashboard/project/yeqfmfgzqzvadhuoqxsl/auth/providers)
- Scroll to "Email" section
- Consider disabling "Confirm email" for faster testing
- Or click the confirmation link sent to the admin email

## Creating Workers

Workers will be created through the POS system interface once logged in as admin.
