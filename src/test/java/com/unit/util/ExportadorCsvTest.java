package com.unit.util;

import static org.junit.jupiter.api.Assertions.*;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

class ExportadorCsvTest {

    @Test
    @DisplayName("Deve gerar arquivo CSV formatado corretamente")
    void testExportacaoCsv() throws IOException {
        File tempFile = File.createTempFile("teste_exportacao", ".csv");
        tempFile.deleteOnExit();

        List<String> linhas = List.of(
                ExportadorCsv.formatarLinhaDuasColunas(100.0, 0.0025),
                ExportadorCsv.formatarLinhaDuasColunas(200.0, 0.0048)
        );

        ExportadorCsv.exportarParaCsv(tempFile.getAbsolutePath(), "Velocidade,Densidade", linhas);

        assertTrue(tempFile.exists(), "Arquivo CSV deve ser criado");
        List<String> conteudo = Files.readAllLines(tempFile.toPath());
        assertEquals("Velocidade,Densidade", conteudo.get(0));
        assertEquals(3, conteudo.size());
    }
}
