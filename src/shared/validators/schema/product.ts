import { z } from "zod";

export const ProductValidateSchema = z.object({
  name: z.string().min(1, { message: 'Nome é obrigatório' }),
  description: z.string().min(1, { message: 'Descrição é obrigatória' }),
  stock: z.number().positive({ message: 'Estoque deve ser maior que zero' }),
  price: z.number().positive({ message: 'Preço deve ser maior que zero' }),
  category: z.string().min(1, { message: 'Categoria é obrigatória' }),
});
