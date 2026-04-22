accounts app
app to see the the accounts and stuff you can do with it (could possibly be front page)
- me (users) view: be able to see ur self, ur profile, ur roles
- if you are admin (has admin object), see same as me but all the available roles, users and be able to create and update the roles and users perms
- Each different role has permissions of every role below
- this app (accounts) so far connects to our own mysql database needs to connect with the companies database 
and their data. They prolly already have accounts this requires reseach (or maybe thats what Eli has done in api
with the providers and serializers **pls ask Eli on how this would work i think thats what his code does**)
- the permissions in this app should be able to set what users can see (modules, tools, etc)

ask Eli what the api app does?

modules app
app to see all the modules and create 
- honestly this seems like a section to create other django apps within this project so 
this section should create the blueprint for how module should be added (view python code that 
should match a template)
- what are modules? they are python code in the form of a django app
- this app would take in the files/folder to the app and add it to the django site
- only the admin should be able to add/create modules
- there should be a check to ensure that the modules can be properly added (check for correct formatting)
- if they are added to the website, admin can choose whether the module is active or not
||on the backend how does this look?
- a section to take it a folder
- validate the folder has the right django setup
` --> mvp being __init__.py and app.py
- force them to go to the accounts app to set the roles/perms for differnt modules?( or can be done here
we will refactor later)
audit app
app to track actions made by users, including login/logout, group changes, using tools
