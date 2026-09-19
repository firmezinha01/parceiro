// Serviço de Consulta de CEP Real via API pública dos Correios / ViaCEP

export interface CepResult {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  error?: boolean;
}

export async function fetchAddressByCep(cep: string): Promise<CepResult | null> {
  const cleanCep = cep.replace(/\D/g, '');
  if (cleanCep.length !== 8) {
    return null;
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    if (data.erro) {
      return { street: '', neighborhood: '', city: '', state: '', zipCode: cleanCep, error: true };
    }

    return {
      street: data.logradouro || '',
      neighborhood: data.bairro || '',
      city: data.localidade || '',
      state: data.uf || '',
      zipCode: data.cep || cleanCep,
      error: false,
    };
  } catch (err) {
    console.warn('Erro ao consultar ViaCEP:', err);
    return null;
  }
}
