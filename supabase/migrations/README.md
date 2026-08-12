# Database migrations

Place timestamped SQL migration files in this directory. Local development
uses the Supabase CLI against the local stack. After migrations merge to
`main`, GitHub Actions applies outstanding files to the linked production
project.

The placeholder platform does not require an application schema yet.
