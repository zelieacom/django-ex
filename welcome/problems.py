import json
import os

from django.http import HttpResponse, HttpResponseNotAllowed, HttpResponseNotFound
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from project.settings import BASE_DIR


@csrf_exempt
def index(request):
    paths = request.path.split('/')
    if paths[1].startswith('problems.'):
        return render(request, 'welcome/' + paths[1])
    problems_dir = os.path.join(os.path.dirname(BASE_DIR), paths[1])
    print(problems_dir)
    paths = paths[2:]
    if len(paths) == 0:
        if request.method == 'POST':
            return post_problems(problems_dir, json.loads(request.body.decode('utf-8')))
        if request.method == 'GET':
            return get_problems(problems_dir)
        return HttpResponseNotAllowed(['POST', 'GET'])
    if len(paths) == 1:
        problem_id = paths[0]
        if request.method == 'GET':
            return get_problem(problems_dir, problem_id)
        if request.method == 'PUT':
            return put_problem(problems_dir, problem_id, json.loads(request.body.decode('utf-8')))
        return HttpResponseNotAllowed(['GET', 'PUT'])
    return HttpResponseNotFound()


def post_problems(problems_dir, problem):
    if not os.path.isdir(problems_dir):
        os.makedirs(problems_dir)
    size = len(os.listdir(problems_dir))
    with open(os.path.join(problems_dir, str(size)), 'w') as f:
        f.write(json.dumps(problem))
        f.close()
    return HttpResponse()


def get_problems(problems_dir):
    if not os.path.isdir(problems_dir):
        return HttpResponseNotFound()
    problems = []
    for problem_file in os.listdir(problems_dir):
        with open(os.path.join(problems_dir, problem_file), 'r') as f:
            problems.append(json.loads(f.read()))
            f.close()
    return HttpResponse(json.dumps(problems), content_type='application/json')


def get_problem(problems_dir, problem_id):
    problem_file = os.path.join(problems_dir, problem_id)
    if (not os.path.isdir(problems_dir)) or (not os.path.exists(problem_file)):
        return HttpResponseNotFound()
    with open(problem_file, 'r') as f:
        contents = json.loads(f.read())
        f.close()
        return HttpResponse(json.dumps(contents), content_type='application/json')


def put_problem(problems_dir, problem_id, problem):
    problem_file = os.path.join(problems_dir, problem_id)
    if (not os.path.isdir(problems_dir)) or (not os.path.exists(problem_file)):
        return HttpResponseNotFound()
    with open(problem_file, 'r') as f:
        try:
            contents = json.loads(f.read())
        except ValueError:
            contents = {}
        f.close()
    for key in problem:
        contents[key] = problem[key]
    with open(problem_file, 'w') as f:
        f.write(json.dumps(contents))
        f.close()
    return HttpResponse()
