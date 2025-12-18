# academic/views.py
from rest_framework import viewsets, status
from rest_framework.response import Response
from ..models import Payment, Student
from rest_framework.decorators import action
from decimal import Decimal

class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    # ... standard serializer etc ...

    @action(detail=False, methods=['post'], url_path='record-payment')
    def record_payment(self, request):
        student_id = request.data.get('student_id')
        amount_val = request.data.get('amount')
        date_paid = request.data.get('date_paid')
        reference = request.data.get('reference', '')

        # 1. Basic Validation
        if not all([student_id, amount_val, date_paid]):
            return Response({"detail": "Missing required fields."}, status=400)

        try:
            amount = Decimal(str(amount_val))
            if amount <= 0:
                return Response({"detail": "Amount must be greater than zero."}, status=400)
        except Exception:
            return Response({"detail": "Invalid amount format."}, status=400)

        # 2. Find Student and Create Payment
        try:
            # We look up by the custom student_id field
            student = Student.objects.get(student_id=student_id)
            
            payment = Payment.objects.create(
                student=student,
                amount=amount,
                date_paid=date_paid,
                reference=reference
            )

            return Response({
                "status": "success",
                "message": f"Payment of ${amount} recorded for {student.full_name}",
                "payment_id": payment.id
            }, status=status.HTTP_201_CREATED)

        except Student.DoesNotExist:
            return Response({"detail": f"Student with ID {student_id} not found."}, status=404)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

    @action(detail=False, methods=['get'], url_path='recent-activity')
    def recent_activity(self, request):
        """Returns the last 10 payments for the logged-in institution."""
        inst_id = request.query_params.get('institution_id')
        if not inst_id:
            return Response({"detail": "Institution ID required"}, status=400)
            
        payments = Payment.objects.filter(student__institution_id=inst_id).order_by('-created_at')[:10]
        data = [{
            "id": p.id,
            "student_name": p.student.full_name,
            "student_id": p.student.student_id,
            "amount": float(p.amount),
            "date": p.date_paid,
            "ref": p.reference
        } for p in payments]
        
        return Response(data)
    
    
    @action(detail=False, methods=['post'], url_path='update-program-fees')
    def update_program_fees(self, request):
        program_id = request.data.get('program_id')
        # Use the key sent by your frontend service ('semester_fee')
        new_fee = request.data.get('semester_fee')

        if not program_id:
            return Response({"detail": "program_id is required"}, status=400)

        try:
            from faculties.models import Program
            
            # 1. Get the program
            program = Program.objects.get(id=program_id)
            
            # 2. Update the field (Check your model: is it annual_fee or semester_fee?)
            program.semester_fee = new_fee 
            
            # 3. CRITICAL: Save to database
            program.save()

            return Response({
                "status": "success", 
                "message": f"Updated {program.name} to {new_fee}"
            }, status=status.HTTP_200_OK)

        except Program.DoesNotExist:
            return Response({"detail": "Program not found"}, status=404)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)