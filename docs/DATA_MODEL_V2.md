# Sadaf Alizadeh Platform Data Model v2

## Users
- id
- name
- email
- mobile
- password/auth provider
- preferred_language (fa/en)
- role (user/admin)

## Portfolio Projects
- title_fa
- title_en
- category
- location
- year
- area
- description
- cover_image
- gallery
- status

Projects are managed from the admin panel and are not hard-coded.

## Digital Tools
Hierarchy:

Software → Category → Product

Software examples:
- AutoCAD
- 3ds Max
- Corona Renderer
- Photoshop
- Lumion
- D5 Render
- AI Tools

Product fields:
- title
- software
- category
- description
- version
- free_or_premium
- price
- download_file
- license_type
- update_history

## Support Tickets
- user_id
- subject
- message
- attachments
- status
- admin_reply

## Project Inquiry
- client_name
- company
- email
- mobile
- project_type
- location
- area
- budget
- timeline
- description
- attachments

## Account Language
Default language: Persian
Optional language: English
Language selection is stored in user profile.
