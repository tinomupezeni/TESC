from django.test import TestCase
from .models import Student
# Create your tests here.
class StudentCountTest(TestCase):

    def test_student_count(self):
        Student.objects.create(name="Alice")
        Student.objects.create(name="Bob")

        count = Student.objects.count()
        self.assertEqual(count, 2)
