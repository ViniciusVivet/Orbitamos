# Testes automatizados – Orbitamos

Este documento descreve a estratégia de testes do projeto, onde ficam os testes, como rodar e como ampliar de forma escalável.

---

## 1. Para que servem os testes automatizados

- **Evitar regressões**: ao mudar código, os testes avisam se algo quebrou.
- **Documentar comportamento**: o que cada classe/endpoint faz fica explícito nos testes.
- **Facilitar refatoração**: dá segurança para melhorar o código sem medo de quebrar.
- **Integração contínua (CI)**: um pipeline pode rodar os testes em todo push/PR.

Não substituem revisão de código nem testes manuais; complementam.

---

## 2. Onde estão os testes

| Parte do projeto | Local dos testes | Ferramentas |
|------------------|------------------|-------------|
| **API (Spring Boot)** | `apps/api/src/test/java` | JUnit 5, Mockito, Spring Test, MockMvc |
| **Web (Next.js)** | (futuro) `apps/web/__tests__` ou `src/**/*.test.tsx` | Vitest + React Testing Library (quando configurado) |

A estrutura em Java espelha o `main`: mesmo pacote para cada classe testada.

Exemplo:
- `src/main/java/.../config/DatasourceUrlEnvironmentPostProcessor.java`
- `src/test/java/.../config/DatasourceUrlEnvironmentPostProcessorTest.java`

---

## 3. Tipos de teste na API

- **Unitário**: testa uma classe isolada, dependências mockadas (ex.: `AuthService` com repositório e JWT mockados).
- **Integração (controller)**: testa um controller com MockMvc; pode usar mocks ou banco em memória (H2).

Nomenclatura sugerida:
- `*Test.java` → testes unitários.
- `*ControllerTest.java` ou `*IT.java` → testes de integração (controller ou com banco).

---

## 4. Como rodar os testes

### API (obrigatório validar antes de commitar)

```bash
cd apps/api
mvn test
```

Para um teste específico:

```bash
mvn test -Dtest=HealthControllerTest
mvn test -Dtest=DatasourceUrlEnvironmentPostProcessorTest
```

### Web (quando houver testes)

```bash
cd apps/web
npm run test
```

---

## 5. Configuração da API para testes

- **Perfil**: os testes usam o perfil `test` quando necessário (ex.: `@ActiveProfiles("test")`).
- **Banco**: em testes que precisam de banco, usa-se H2 em memória (configurado em `application-test.yml`), sem PostgreSQL.
- **Segurança**: em testes de controller com MockMvc, usa-se `@AutoConfigureMockMvc(addFilters = false)` e `@MockBean` do `JwtAuthenticationFilter` quando o contexto carrega a segurança, para não depender de JWT nos testes.

Arquivos relevantes:
- `apps/api/src/test/resources/application-test.yml` – datasource H2, JWT de teste, etc.

---

## 6. Boas práticas (escalável)

1. **Um assert por comportamento**: preferir um teste que valida um comportamento claro; vários asserts no mesmo método só se forem do mesmo “caso”.
2. **Nomes que descrevem o cenário**: ex. `deveRetornar200QuandoHealthForChamado()` em vez de `testHealth()`.
3. **Não depender de ordem**: testes devem poder rodar em qualquer ordem.
4. **Mocks só onde precisar**: unitários mockam dependências; integração usa o mínimo de mocks necessário.
5. **Manter rápido**: unitários sem Spring quando possível; integração só onde agrega valor.
6. **Novo código, novo teste**: ao criar serviço/controller importante, adicionar pelo menos um teste que valide o fluxo principal.

---

## 7. Adicionando novos testes

1. Criar a classe em `src/test/java` no **mesmo pacote** da classe testada.
2. Usar sufixo `Test` (unitário) ou `ControllerTest` / `IT` (integração).
3. Rodar `mvn test` e garantir que passa antes de commitar.
4. Se o teste precisar de banco, usar perfil `test` e H2 (ver `application-test.yml`).

Exemplo mínimo de teste unitário (JUnit 5 + Mockito):

```java
@Test
void deveFazerAlgoQuandoCondicaoX() {
    // arrange
    when(dependencia.metodo()).thenReturn(valor);
    // act
    var resultado = servico.metodo();
    // assert
    assertThat(resultado).isEqualTo(esperado);
}
```

---

## 8. CI (futuro)

Para rodar os testes em todo push/PR, configure um job que execute:

- `cd apps/api && mvn test`
- (opcional) `cd apps/web && npm run test`

Ex.: GitHub Actions, GitLab CI ou equivalente; o manual de uso continua sendo “rodar `mvn test` / `npm run test`” como acima.
