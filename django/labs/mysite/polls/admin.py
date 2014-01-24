from django.contrib import admin
from polls.models import Poll
from polls.models import Choice

# Register your models here.

# v1
#admin.site.register(Poll)

#v2
#class PollAdmin(admin.ModelAdmin):
#    fields = ['pub_date', 'question']   # the order is reverted
#
#admin.site.register(Poll, PollAdmin)

#v3
class ChoiceInline(admin.StackedInline):
    model = Choice
    extra = 3
    
class PollAdmin2(admin.ModelAdmin):
    fieldsets    = [
        (None, {'fields': ['question']}),
        ('Date information', {'fields': ['pub_date'], 'classes': ['collapse']})
    ]
    inlines      = [ChoiceInline]
    list_display = ('question', 'pub_date', 'wasPublishedRecently')
    list_filter  = ['pub_date']
    search_field = ['question']

admin.site.register(Poll, PollAdmin2)

# see the class ChoiceInline
#admin.site.register(Choice)
