
import hashlib
import re

from cryptography.fernet import Fernet
from django.conf import settings
from django.db import models


class EncryptedCPFField(models.CharField):

    def encrypt(self, value):
        if not value:
            return value

        key = settings.CPF_ENCRYPTION_KEY

        if not key:
            raise ValueError("Chave de criptografia do CPF não configurada.")

        fernet = Fernet(key.encode())
        return fernet.encrypt(value.encode()).decode()

    def decrypt(self, value):
        if not value:
            return value

        key = settings.CPF_ENCRYPTION_KEY

        if not key:
            raise ValueError("Chave de criptografia do CPF não configurada.")

        fernet = Fernet(key.encode())
        return fernet.decrypt(value.encode()).decode()

    def get_prep_value(self, value):
        value = super().get_prep_value(value)

        if value is None:
            return None

        return self.encrypt(value)

    def from_db_value(self, value, expression, connection):
        if value is None:
            return value

        return self.decrypt(value)


def gerar_hash_cpf(cpf):
    cpf_limpo = re.sub(r'\D', '', cpf)
    return hashlib.sha256(cpf_limpo.encode()).hexdigest()
