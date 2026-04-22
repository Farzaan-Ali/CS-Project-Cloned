from django.db import models

# Create your models here.
'''
this model (table) will not store all the files/folders of the python
code that'll make up the modules (major safety risk). Modules would be in the form
of a django app to allow for easy adding into site, and this app checks to see the 
the module is active?
'''
class Modules(models.Model):
     name = models.CharField(max_length=20)
     desc = models.TextField()
     actv = models.BooleanField()
     

