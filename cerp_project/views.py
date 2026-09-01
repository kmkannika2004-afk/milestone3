from django.shortcuts import render

def dashboard_view(request):
    """Renders the Community Emergency Response Platform Web Application Dashboard"""
    return render(request, 'index.html')
