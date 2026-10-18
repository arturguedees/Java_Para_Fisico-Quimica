package com.unit.controller;

import com.unit.modelo.ClasseGas;
import com.unit.modelo.DistribuicaoMaxwellBoltzmann;
import com.unit.modelo.Gas;
import com.unit.numerico.CalculadoraMaxwell;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/**
 * Controller que calcula a Distribuicao de Maxwell-Boltzmann dos gases ideais.
 * Ele devolve tanto a curva de velocidade f(v) quanto a de energia cinetica f(E) e a integral de Ea!
 */
@RestController
@RequestMapping("/api/maxwell")
@CrossOrigin(origins = "*")
public class MaxwellController {

    private final CalculadoraMaxwell calculadora = new CalculadoraMaxwell();

    @GetMapping("/gases")
    public List<Map<String, Object>> listarGases() {
        List<Map<String, Object>> lista = new ArrayList<>();
        // Percorre o enum de gases padrao e monta o JSON pro frontend
        for (Gas g : Gas.values()) {
            Map<String, Object> map = new HashMap<>();
            map.put("chave", g.name());
            map.put("nome", g.nomeFormatado());
            map.put("simbolo", g.simbolo());
            map.put("massaMolarKgPorMol", g.massaMolarKgPorMol());
            map.put("massaMolarGPorMol", g.massaMolarKgPorMol() * 1000.0);
            map.put("coeficienteAdiabatico", g.coeficienteAdiabatico());
            lista.add(map);
        }
        return lista;
    }

    @GetMapping("/calcular")
    public Map<String, Object> calcularDistribuicao(
            @RequestParam(defaultValue = "ARGONIO") String gasNome,
            @RequestParam(defaultValue = "300") double temperaturaKelvin,
            @RequestParam(defaultValue = "20000") double energiaAtivacaoJPorMol,
            @RequestParam(defaultValue = "200") double v1,
            @RequestParam(defaultValue = "600") double v2,
            @RequestParam(required = false) Double massaCustomKgPorMol,
            @RequestParam(required = false) Double gamaCustom) {

        // Garante que a temperatura seja pelo menos 10 K pra nao dar divisao por zero na formula
        double tempK = Math.max(10.0, temperaturaKelvin);

        ClasseGas classeGas;
        String simboloGas;
        // Se o aluno escolheu "CUSTOM", monta um gas personalizado com a massa e o gama que ele digitou
        if ("CUSTOM".equalsIgnoreCase(gasNome) && massaCustomKgPorMol != null && gamaCustom != null) {
            double mCustom = Math.max(0.001, massaCustomKgPorMol);
            double gCustom = Math.max(1.01, gamaCustom);
            classeGas = new ClasseGas("Gás Personalizado", mCustom, gCustom);
            simboloGas = "Custom";
        } else {
            Gas gasEnum;
            try {
                gasEnum = Gas.valueOf(gasNome.toUpperCase());
            } catch (Exception e) {
                gasEnum = Gas.ARGONIO;
            }
            classeGas = new ClasseGas(gasEnum);
            simboloGas = gasEnum.simbolo();
        }

        DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(classeGas, tempK);
        // Crio tambem uma distribuicao fixa em 300 K pra desenhar aquela linha tracejada de comparacao no grafico
        DistribuicaoMaxwellBoltzmann distRef300K = new DistribuicaoMaxwellBoltzmann(classeGas, 300.0);

        double vmp = dist.velocidadeMaisProvavel();
        double vm = dist.velocidadeMedia();
        double vrms = dist.velocidadeQuadraticaMedia();
        double som = dist.velocidadeDoSom();
        double energiaMaisProvavel = 0.5 * 8.314462618 * tempK;
        double energiaCineticaMedia = 1.5 * 8.314462618 * tempK;

        // Gases muito leves tipo Helio e Hidrogenio tem velocidades bem maiores, entao aumento o limite do eixo X
        boolean gasLeve = classeGas.getMassaMolarKgPorMol() < 0.010;
        double maxVelocidadePadrao = gasLeve ? 5500.0 : 2500.0;
        double maxVelocidade = Math.max(maxVelocidadePadrao, vrms * 3.0);
        int numPontos = 150;
        double passoV = maxVelocidade / numPontos;

        List<Double> velocidades = new ArrayList<>();
        List<Double> densidadesVelocidade = new ArrayList<>();
        List<Double> densidadesVelocidadeRef300K = new ArrayList<>();

        for (int i = 0; i <= numPontos; i++) {
            double v = i * passoV;
            velocidades.add(v);
            densidadesVelocidade.add(dist.densidadeProbabilidadeVelocidade(v));
            densidadesVelocidadeRef300K.add(distRef300K.densidadeProbabilidadeVelocidade(v));
        }

        // Faz a mesma coisa para a curva de energia cinetica translacional f(E)
        double maxEnergia = Math.max(50000.0, 6.0 * 8.314462618 * tempK);
        double passoE = maxEnergia / numPontos;
        List<Double> energias = new ArrayList<>();
        List<Double> densidadesEnergia = new ArrayList<>();
        List<Double> densidadesEnergiaRef300K = new ArrayList<>();

        for (int i = 0; i <= numPontos; i++) {
            double e = i * passoE;
            energias.add(e);
            densidadesEnergia.add(dist.densidadeProbabilidadeEnergia(e));
            densidadesEnergiaRef300K.add(distRef300K.densidadeProbabilidadeEnergia(e));
        }

        // Calcula a integral por Simpson 1/3 pra achar a fracao de moleculas que vencem a Energia de Ativacao (Ea)
        double fracaoAcimaEa = calculadora.calcularFracaoEnergiaAtivacao(classeGas, tempK, Math.max(0.0, energiaAtivacaoJPorMol));
        double probIntervalo = (v2 > v1 && v1 >= 0)
                ? calculadora.calcularProbabilidadeIntervalo(classeGas, tempK, v1, v2)
                : 0.0;

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("gas", classeGas.getNome());
        resposta.put("simbolo", simboloGas);
        resposta.put("temperatura", tempK);
        resposta.put("massaMolarKgPorMol", classeGas.getMassaMolarKgPorMol());
        resposta.put("coeficienteAdiabatico", classeGas.getCoeficienteAdiabatico());

        resposta.put("velocidades", velocidades);
        resposta.put("densidadesVelocidade", densidadesVelocidade);
        resposta.put("densidadesVelocidadeRef300K", densidadesVelocidadeRef300K);
        resposta.put("energias", energias);
        resposta.put("densidadesEnergia", densidadesEnergia);
        resposta.put("densidadesEnergiaRef300K", densidadesEnergiaRef300K);

        resposta.put("velocidadeMaisProvavel", vmp);
        resposta.put("velocidadeMedia", vm);
        resposta.put("velocidadeQuadraticaMedia", vrms);
        resposta.put("velocidadeDoSom", som);
        resposta.put("energiaMaisProvavel", energiaMaisProvavel);
        resposta.put("energiaCineticaMedia", energiaCineticaMedia);
        resposta.put("fracaoAcimaEa", fracaoAcimaEa);
        resposta.put("probabilidadeIntervalo", probIntervalo);

        return resposta;
    }

    @GetMapping("/comparar")
    public Map<String, Object> compararGases(@RequestParam(defaultValue = "300") double temperaturaKelvin) {
        // Endpoint que gera as curvas dos 5 gases juntos na mesma temperatura pra ver o efeito da massa molar!
        double tempK = Math.max(10.0, temperaturaKelvin);
        double maxVelocidade = 4500.0;
        int numPontos = 150;
        double passoV = maxVelocidade / numPontos;

        List<Double> velocidades = new ArrayList<>();
        for (int i = 0; i <= numPontos; i++) {
            velocidades.add(i * passoV);
        }

        List<Map<String, Object>> seriesGases = new ArrayList<>();
        for (Gas g : Gas.values()) {
            ClasseGas cg = new ClasseGas(g);
            DistribuicaoMaxwellBoltzmann dist = new DistribuicaoMaxwellBoltzmann(cg, tempK);
            List<Double> densidades = new ArrayList<>();
            for (double v : velocidades) {
                densidades.add(dist.densidadeProbabilidadeVelocidade(v));
            }
            Map<String, Object> item = new HashMap<>();
            item.put("chave", g.name());
            item.put("nome", g.nomeFormatado() + " (" + g.simbolo() + ")");
            item.put("velocidadeMaisProvavel", dist.velocidadeMaisProvavel());
            item.put("velocidadeMedia", dist.velocidadeMedia());
            item.put("velocidadeQuadraticaMedia", dist.velocidadeQuadraticaMedia());
            item.put("velocidadeDoSom", dist.velocidadeDoSom());
            item.put("densidades", densidades);
            seriesGases.add(item);
        }

        Map<String, Object> resposta = new HashMap<>();
        resposta.put("temperatura", tempK);
        resposta.put("velocidades", velocidades);
        resposta.put("series", seriesGases);
        return resposta;
    }
}
