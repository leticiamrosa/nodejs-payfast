module.exports = function(app) {
  app.get("/pagamentos", function(req, res) {
    console.log("Recebida requisicao de teste na porta 3000.");
    res.send("OK.");
  });

  // Confirmar pagamento
  app.put("/pagamentos/pagamento/:id", function(req, res) {
    var pagamento = {};
    var id = req.params.id;

    pagamento.id = id;
    pagamento.status = "CONFIRMADO";

    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento, function(error) {
      if (erro) {
        res.status(500).send(erro);
        return;
      }
      console.log("Pagamento criado");
      res.send(pagamento);
    });
  });

  // Cancelar pagamento
  app.delete("/pagamentos/pagamento/:id", function(req, res) {
    var pagamento = {};
    var id = req.params.id;

    pagamento.id = id;
    pagamento.status = "CANCELADO";

    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.PagamentoDao(connection);

    pagamentoDao.atualiza(pagamento, function(erro) {
      if (erro) {
        res.status(500).send(erro);
        return;
      }
      console.log("pagamento cancelado");
      res.status(204).send(pagamento);
    });
  });

  // Pagamento
  app.post("/pagamentos/pagamento", function(req, res) {
    req
      .assert("forma_de_pagamento", "Forma de pagamento eh obrigatorio")
      .notEmpty();
    req
      .assert("valor", "Valor eh obrigatorio e deve ser um decimal")
      .notEmpty()
      .isFloat();

    var erros = req.validationErrors();

    if (erros) {
      console.log("Erros de validacao encontrados");
      res.status(400).send(erros);
      return;
    }

    var pagamento = req.body;
    console.log("processando uma requisicao de um novo pagamento");

    pagamento.status = "CRIADO";
    pagamento.data = new Date();

    var connection = app.persistencia.connectionFactory();
    var pagamentoDao = new app.persistencia.pagamentoDao(connection);

    pagamentoDao.salva(pagamento, function(erro, resultado) {
      if (erro) {
        console.log("Erro ao inserir no banco:" + erro);
        res.status(500).send(erro);
      } else {
        console.log("pagamento criado");
        res.location("/pagamentos/pagamento/" + resultado.insertId);

        res.status(201).json(pagamento);
      }
    });
  });

  // Cartao
  app.post("/cartoes/autoriza", function(req, res) {
    console.log("processando pagamento com cartão");

    var cartao = req.body;

    req
      .assert("numero", "Número é obrigatório e deve ter 16 caracteres.")
      .notEmpty()
      .len(16, 16);
    req.assert("bandeira", "Bandeira do cartão é obrigatória.").notEmpty();
    req
      .assert(
        "ano_de_expiracao",
        "Ano de expiração é obrigatório e deve ter 4 caracteres."
      )
      .notEmpty()
      .len(4, 4);
    req
      .assert(
        "mes_de_expiracao",
        "Mês de expiração é obrigatório e deve ter 2 caracteres"
      )
      .notEmpty()
      .len(2, 2);
    req
      .assert("cvv", "CVV é obrigatório e deve ter 3 caracteres")
      .notEmpty()
      .len(3, 3);

    var errors = req.validationErrors();

    if (errors) {
      console.log("Erros de validação encontrados");

      res.status(400).send(errors);
      return;
    }
    cartao.status = "AUTORIZADO";

    var response = {
      dados_do_cartao: cartao
    };

    res.status(201).json(response);
    return;
  });
};
