# Teste do Sistema de Contadores - FilaZero

## 🧪 **Como Testar o Sistema**

### **1. Teste Básico dos Contadores**
```
1. Abra a página Ponto de Atendimento
2. Clique em um produto → deve aparecer badge azul "1"
3. Clique novamente → badge deve virar "2"
4. Clique em outro produto → badge "1" deve aparecer nele
5. Botão salvar deve mostrar "Salvar (3)"
```

### **2. Teste da Listagem de Itens**
```
1. Após clicar nos produtos, verifique o Painel Detalhes
2. Deve listar:
   - Quantidade: 2x, 1x
   - Nome: Nome do produto
   - Total: R$ X,XX (preço × quantidade)
   - Lixeirinha: Ícone de lixeira para cada item
```

### **3. Teste da Lixeirinha**
```
1. Clique na lixeirinha de um item com quantidade > 1
   - Quantidade deve reduzir em 1
   - Total deve ser recalculado
   - Contador no card deve ser atualizado

2. Clique na lixeirinha de um item com quantidade = 1
   - Item deve sair da lista
   - Contador no card deve desaparecer
   - Valor total deve ser recalculado
```

### **4. Teste de Sincronização**
```
1. Adicione produtos no Painel Itens
2. Verifique se aparecem no Painel Detalhes
3. Use a lixeirinha no Painel Detalhes
4. Verifique se contadores no Painel Itens são atualizados
```

## 🔍 **Logs para Debug**

### **Console do Painel Itens**
- `Adicionando produto: [Nome] ID: [ID]`
- `Novo estado dos itens: {[ID]: quantidade}`
- `Enviando itens para listagem: [Array de itens]`
- `Pedido preparado: [Objeto do pedido]`
- `Total de itens: [Número]`

### **Console da Página Principal**
- `Itens atualizados: [Array de itens]`

## ✅ **Verificações de Funcionamento**

### **Contadores Funcionando**
- [ ] Badge azul aparece ao clicar no produto
- [ ] Número aumenta a cada clique
- [ ] Cada produto tem contador independente
- [ ] Badge só aparece quando quantidade > 0

### **Listagem de Itens Funcionando**
- [ ] Produtos aparecem na listagem ao serem clicados
- [ ] Quantidade, nome e total são exibidos corretamente
- [ ] Valores são calculados automaticamente
- [ ] Estado vazio é exibido quando não há itens

### **Lixeirinha Funcionando**
- [ ] Reduz quantidade em 1 a cada clique
- [ ] Remove item quando quantidade = 0
- [ ] Recalcula valores automaticamente
- [ ] Atualiza contadores nos cards

### **Botão Salvar Funcionando**
- [ ] Mostra total de itens entre parênteses
- [ ] Fica desabilitado quando não há itens
- [ ] Limpa contadores após salvar

### **Sincronização Funcionando**
- [ ] Mudanças no Painel Itens refletem no Painel Detalhes
- [ ] Mudanças no Painel Detalhes refletem no Painel Itens
- [ ] Contadores sempre sincronizados
- [ ] Valores sempre atualizados

## 🐛 **Problemas Comuns e Soluções**

### **Contador não aparece**
- Verificar se `handleProdutoClick` está sendo chamado
- Verificar se `setItensSelecionados` está funcionando
- Verificar se `onItemUpdate` está sendo passado corretamente

### **Listagem não atualiza**
- Verificar se `useEffect` está sendo executado
- Verificar se `onItemUpdate` está sendo chamado
- Verificar se estado `itensAtuais` está sendo atualizado

### **Lixeirinha não funciona**
- Verificar se `handleReduceItem` está sendo chamado
- Verificar se `onItemUpdate` está sendo chamado
- Verificar se contadores estão sendo sincronizados

## 🎯 **Resultado Esperado**

O sistema deve funcionar de forma fluida e intuitiva:
1. **Clique no produto** → contador ativa, item aparece na listagem
2. **Lixeirinha** → reduz quantidade, atualiza contadores
3. **Sincronização** → mudanças refletem em ambos os painéis
4. **Valores** → sempre calculados automaticamente
5. **Interface** → limpa, responsiva e profissional

## 🚀 **Para Testar Agora**

1. Abra o navegador em `http://localhost:5174/`
2. Navegue para a página de Ponto de Atendimento
3. Teste clicando nos produtos
4. Verifique se contadores aparecem
5. Verifique se itens são listados
6. Teste a funcionalidade da lixeirinha
7. Verifique se tudo está sincronizado
