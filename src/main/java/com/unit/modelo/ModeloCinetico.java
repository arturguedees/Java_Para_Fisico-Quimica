package com.unit.modelo;

public interface ModeloCinetico {
    double concentracaoA(double tempo);
    double concentracaoB(double tempo);
    double primeiraMeiaVida();
    double concentracaoInicial();
    double constanteVelocidade();
    int obterOrdem();
}
