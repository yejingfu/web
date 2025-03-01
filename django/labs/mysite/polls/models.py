from django.db import models
from django.utils import timezone

# Create your models here.
class Poll(models.Model):
    question = models.CharField(max_length=200)
    pub_date = models.DateTimeField('date published')

    def __unicode__(self):
        return self.question

    def wasPublishedRecently(self):
        return self.pub_date > timezone.now() - timezone.timedelta(days = 1)
        
    wasPublishedRecently.admin_order_field = 'pub_date'
    wasPublishedRecently.boolean           = True
    wasPublishedRecently.short_description = 'Published recently?'
#    search_field = ['question']

class Choice(models.Model):
    poll        = models.ForeignKey(Poll)
    choice_text = models.CharField(max_length = 200)
    votes       = models.IntegerField(default = 0)

    def __unicode__(self):
        return self.choice_text


    
