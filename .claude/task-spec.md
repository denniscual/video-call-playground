# Task Specification

## Project Setups

- Supabase for postgres
  - Project URL: https://wpggkfbcmekytsjcrrma.supabase.co
  - API KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZ2drZmJjbWVreXRzamNycm1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY0NzM2OTcsImV4cCI6MjA3MjA0OTY5N30.LCDjzr46d56BVRD0LTjPJdzS-9iNMuvG4bY5dN-N8YM
- Use Drizzle for ORM

## Architecture

- Use React Server Components (App Router Next JS)
- Use Server Actions
- Lets avoid for now using the Nextjs API routes, meaning we are going to leverage the RSC and Server Actions
- For the API keys, make sure to put into the next environment variables

### Basic Postgres Database

Our plan is to build a video call app using the AWS Chime. Meaning we need a table for meetings and then attendees. Host can create a meeting, and then user can join the created meeting. The meeting url
will be shared to other attendees. Participants retrieves the meeting and then join. HOst can end/delete the meeting.

### Drizzle

Make sure to use drizzle ORM to interact with the supabase db. Use this docs on how to setup supabase + drizzle https://supabase.com/docs/guides/database/drizzle

## Basic Requirements

- Becauase in the initial phase we are not goint to integrate the AWS Chime service, to be able we can test the database, lets create a page where the user can manually create a meeting and then there's a list to
  show all meeting calls. List item has a link to view the meeting call. To create meeting call, render a form with a meeting url fields. The list renders this meeting with the id and meeting url columns.
- Pages need- home page shows the meeting list + form. meeting page to render the specific meeting.
