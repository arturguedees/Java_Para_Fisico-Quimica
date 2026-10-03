package com.unit.util;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

public final class ExportadorCsv {
    private ExportadorCsv() {}

    public static File exportarParaCsv(String caminhoArquivo, String cabecalho, List<String> linhas) throws IOException {
        File arquivo = new File(caminhoArquivo);
        File diretorioPai = arquivo.getParentFile();
        if (diretorioPai != null && !diretorioPai.exists()) {
            diretorioPai.mkdirs();
        }

        try (BufferedWriter writer = new BufferedWriter(new FileWriter(arquivo, StandardCharsets.UTF_8))) {
            writer.write(cabecalho);
            writer.newLine();
            for (String linha : linhas) {
                writer.write(linha);
                writer.newLine();
            }
        }
        return arquivo;
    }

    public static String formatarLinhaDuasColunas(double x, double y) {
        return String.format(Locale.US, "%.6f,%.6f", x, y);
    }

    public static String formatarLinhaTresColunas(double x, double y1, double y2) {
        return String.format(Locale.US, "%.6f,%.6f,%.6f", x, y1, y2);
    }
}
