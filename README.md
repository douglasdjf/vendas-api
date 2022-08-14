# Vendas-Api

### Projeto utilizado para implementar no heroku o microserviço vendas-api do projeto microservico-vendas-produto.


# Heroku

## Configuração do projeto para implantar no heroku

criar o arquivo Procfile e adicionar o codigo:

```
web: yarn start
```

verificar se o arquivo package.json o campo scripts está configurado com a linha de comando

```
"start": "node app.js"
```

trecho scripts:

```
  "scripts": {
    "startDev": "nodemon app.js",
    "start": "node app.js"
  }
```
