from django.db import models


class Question(models.Model):
    big_id = models.BigAutoField(primary_key=True)
    question = models.CharField(max_length=20)

    def __str__(self):
        return self.question
