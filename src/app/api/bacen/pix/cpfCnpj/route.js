import { NextResponse } from "next/server";
import axios from "axios";
import { prisma } from "/src/lib/prisma";
import { verifyJwtToken } from "/src/app/auth/validateToken";

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    let lista = [];
    let cpfResponsavel = searchParams.get('cpfResponsavel');
    let lotacao = searchParams.get('lotacao');
    let token = (searchParams.get('token'));
    let cpfCnpj = searchParams.get('cpfCnpj');
    let motivo = searchParams.get('motivo');
    let data = new Date();
    let caso = searchParams.get('caso');
    var credentials = btoa(process.env.usernameBC + ':' + process.env.passwordBC);
    var basicAuth = 'Basic ' + credentials;
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://www3.bcb.gov.br/bc_ccs/rest/consultar-vinculos-pix?cpfCnpj=' + cpfCnpj + '&motivo=' + motivo,
        headers: {
            'Accept': 'application/json',
            'Authorization': basicAuth,
        }
    };

    const validToken = await verifyJwtToken(token)
    if (validToken) {
        const vinculos = await axios.request(config)
            .then(res1 => res1.data.vinculosPix)
            .then(async (chaves) => {

                if (chaves.length > 0) {
                    // Ordena as chaves PIX recebidas para que as primeiras contenham CPF e Nome, preferencialmente

                    await chaves.sort((a, b) => a.cpfCnpj && a.nomeProprietario ? -1 : (a.cpfCnpj ? -1 : 1))

                    // Replica as informações de CPF e Nome para as demais chaves que não tenham tais informações

                    let nomeProprietarioBusca = chaves[0].nomeProprietario ? chaves[0].nomeProprietario : 'NOME NÃO INFORMADO';
                    let cpfCnpjBusca = cpfCnpj;

                    for await (let chave of chaves) {
                        await axios.get('https://www3.bcb.gov.br/informes/rest/pessoasJuridicas?cnpj=' + chave.participante)
                            .then(response => response.data)
                            .then((participante) => {
                                chave.numerobanco = (participante.codigoCompensacao ? participante.codigoCompensacao.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false }) : '000');
                                chave.nomebanco = participante.nome;
                                chave.cpfCnpjBusca = cpfCnpjBusca;
                                chave.nomeProprietarioBusca = nomeProprietarioBusca;
                            })
                            .catch((err) => {
                                chave.numerobanco = "000";
                                chave.nomebanco = "BANCO NÃO INFORMADO";
                                chave.cpfCnpjBusca = cpfCnpjBusca;
                                chave.nomeProprietarioBusca = nomeProprietarioBusca;
                            })
                        for await (let evento of chave.eventosVinculo) {
                            await axios.get('https://www3.bcb.gov.br/informes/rest/pessoasJuridicas?cnpj=' + evento.participante)
                                .then(response => response.data)
                                .then((participante) => {
                                    evento.numerobanco = (participante.codigoCompensacao ? participante.codigoCompensacao.toLocaleString('en-US', { minimumIntegerDigits: 3, useGrouping: false }) : '000');
                                    evento.nomebanco = participante.nome;
                                })
                                .catch((err) => {
                                    evento.numerobanco = "000";
                                    evento.nomebanco = "BANCO NÃO INFORMADO"
                                })
                        }
                        if (chave.status == null) {
                            chave.status = 'INATIVO'
                        }
                    }

                    // armazena as informações da requisição contendo os dados do solicitante e a resposta obtida

                    let requisicao = {
                        data: data,
                        cpfResponsavel: cpfResponsavel,
                        lotacao: lotacao,
                        caso: caso,
                        tipoBusca: 'cpf/cnpj',
                        chaveBusca: cpfCnpj,
                        motivoBusca: motivo,
                        resultado: 'Sucesso',
                        vinculos: chaves,
                        autorizado: true,
                        chaves: {
                            create: chaves.map(chave => ({
                                chave: chave.chave,
                                tipoChave: chave.tipoChave,
                                status: chave.status,
                                dataAberturaReivindicacao: chave.dataAberturaReivindicacao,
                                cpfCnpj: chave.cpfCnpj,
                                nomeProprietario: chave.nomeProprietario,
                                nomeFantasia: chave.nomeFantasia,
                                participante: chave.participante,
                                agencia: chave.agencia,
                                numeroConta: chave.numeroConta,
                                tipoConta: chave.tipoConta,
                                dataAberturaConta: chave.dataAberturaConta,
                                proprietarioDaChaveDesde: chave.proprietarioDaChaveDesde,
                                dataCriacao: chave.dataCriacao,
                                ultimaModificacao: chave.ultimaModificacao,
                                numeroBanco: chave.numerobanco,
                                nomeBanco: chave.nomebanco,
                                cpfCnpjBusca: chave.cpfCnpjBusca,
                                nomeProprietarioBusca: chave.nomeProprietarioBusca,
                                eventosVinculo: {
                                    create: chave.eventosVinculo.map(evento => ({
                                        tipoEvento: evento.tipoEvento,
                                        motivoEvento: evento.motivoEvento,
                                        dataEvento: evento.dataEvento,
                                        chave: evento.chave,
                                        tipoChave: evento.tipoChave,
                                        cpfCnpj: evento.cpfCnpj,
                                        nomeProprietario: evento.nomeProprietario,
                                        nomeFantasia: evento.nomeFantasia,
                                        participante: evento.participante,
                                        agencia: evento.agencia,
                                        numeroConta: evento.numeroConta,
                                        tipoConta: evento.tipoConta,
                                        dataAberturaConta: evento.dataAberturaConta,
                                        numeroBanco: evento.numerobanco,
                                        nomeBanco: evento.nomebanco
                                    }))
                                }
                            }))
                        },
                    }
                    try {
                        await prisma.requisicaoPix.create({
                            data: requisicao
                        }).then(
                            lista.push(chaves)
                        )
                    } catch (e) {
                        throw e
                    }
                } else {
                    // armazena as informações da requisição, mesmo que haja algum erro na consulta, por exemplo CPF/CNPJ incorreto.
                    let requisicao = {
                        data: data,
                        cpfResponsavel: cpfResponsavel,
                        lotacao: lotacao,
                        caso: caso,
                        tipoBusca: 'cpf/cnpj',
                        chaveBusca: cpfCnpj,
                        motivoBusca: motivo,
                        autorizado: true,
                        resultado: "Nenhuma Chave PIX encontrada",
                    }
                    try {
                        await prisma.requisicaoPix.create({
                            data: requisicao
                        }).then(
                            lista.push("Nenhuma Chave PIX encontrada")
                        )
                    } catch (e) {
                        throw e
                    }

                }

            })
            .catch(async (error) => {
                console.log(error)
                // armazena as informações da requisição, mesmo que haja algum erro na consulta, por exemplo CPF/CNPJ incorreto.
                let requisicao = {
                    data: data,
                    cpfResponsavel: cpfResponsavel,
                    lotacao: lotacao,
                    caso: caso,
                    tipoBusca: 'cpf/cnpj',
                    chaveBusca: cpfCnpj,
                    motivoBusca: motivo,
                    autorizado: true,
                    resultado: (error.response.data.message == '0002 - ERRO_CPF_CNPJ_INVALIDO') ? 'CPF/CNPJ não encontrado' : "Erro no processamento da Solicitação",
                }
                try {
                    await prisma.requisicaoPix.create({
                        data: requisicao
                    }).then(
                        lista.push((error.response.data.message) ? "CPF/CNPJ não encontrado" : "Erro no processamento da Solicitação")
                    )
                } catch (e) {
                    throw e
                }
            })

        return NextResponse.json(lista)
    } else {
        return NextResponse.json(lista)
    }
}