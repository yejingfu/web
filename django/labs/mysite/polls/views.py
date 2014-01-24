from django.shortcuts import render, get_object_or_404
from django.http import HttpResponse, HttpResponseRedirect, Http404
from django.template import RequestContext, loader
from django.core.urlresolvers import reverse
from polls.models import Poll, Choice

# Create your views here.
''' Version 1: manually generate / prepare the view pages

def index(request):
    polllist = Poll.objects.order_by("-pub_date")[0:5]
    # v1
    #output  = ', '.join([p.question for p in polllist])
    #return HttpResponse("Index of Poll:<br>" + output)

    #v2
    templ = loader.get_template('polls/index.html')
    ctx = RequestContext(request, {'poll_list': polllist})
    return HttpResponse(templ.render(ctx))

def detail(request, pollid):
    #v1 shortcut version
    #poll = get_object_or_404(Poll, pk=pollid)
    
    # v2
    try:
        poll = Poll.objects.get(pk = pollid)  #pk = primary key
    except Poll.DoesNotExist:
        raise Http404

    # render() is the short cut of template.render()
    return render(request, 'polls/detail.html', {'poll':poll})
            

def results(request, pollid):
    poll = get_object_or_404(Poll, pk=pollid)

    return render(request, 'polls/results.html', {'poll':poll})

def vote(request, pollid):
    poll     = get_object_or_404(Poll, pk = pollid)

    try:
        choiceid               = request.POST['choice']
        print ">>>>>>choiceid:", choiceid
        selectedChoice         = poll.choice_set.get(pk = choiceid)
    except (KeyError, Choice.DoesNotExist):
        return render(request, 'polls/detail.html', {'poll':poll, 'err_msg':'You did not select a choice.'})
    else:
        selectedChoice.votes += 1
        selectedChoice.save()
        
        # v1
        return HttpResponseRedirect('/polls/'+str(poll.id)+'/results/')
        
        # v2 redirect to result
        #return HttpResponseRedirect(reverse('polls:results', args = (poll.id,)))
'''

''' Version 2: generic views'''

from django.views import generic

class IndexView(generic.ListView):
    template_name       = 'polls/index.html'
    context_object_name = 'poll_list'

    def get_queryset(self):
        return Poll.objects.order_by('pub_date')[:5]

class DetailView(generic.DetailView):
    template_name = 'polls/detail.html'
    model = Poll

class ResultView(generic.DetailView):
    template_name = 'polls/results.html'
    model = Poll

def vote(request, pollid):
    poll = get_object_or_404(Poll, pk=pollid)

    try:
        choiceid               = request.POST['choice']
        selectedChoice         = poll.choice_set.get(pk = choiceid)
    except (KeyError, Choice.DoesNotExist):
        return render(request, 'polls/detial.html', {'poll':poll, 'err_msg': 'You did not select a choice.'})
    else:
        selectedChoice.votes += 1
        selectedChoice.save()
        return HttpResponseRedirect(reverse('polls:results', args=(poll.id,)))
        
