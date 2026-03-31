# Java — SKILL

## Overview
Enterprise-grade language with Spring Boot 3.4+ for production-ready APIs.
Java 21 LTS (current) with virtual threads, pattern matching, record patterns, sealed classes.
Java 24 (Mar 2025) adds stream gatherers, structured concurrency previews.

## Setup / Base Project
```bash
# Java 21 LTS (use sdkman)
sdk install java 21-tem
# Spring Boot via Spring Initializr
curl https://start.spring.io/starter.zip \
  -d dependencies=web,data-jpa,security,validation \
  -d javaVersion=21 -d type=maven-project \
  -d bootVersion=3.4.0 -o my-app.zip
# Or use Spring CLI
spring init --dependencies=web,data-jpa my-app
```

## Core Concepts
- **Spring Boot 3.4** — auto-configuration, embedded Tomcat, actuator, structured logging
- **Records** — `record UserDto(String name, String email) {}` for immutable DTOs
- **Virtual Threads** — `spring.threads.virtual.enabled=true` for massive concurrency
- **JPA/Hibernate** — `@Entity`, `JpaRepository<User, Long>` for data access
- **Spring Security 6** — `SecurityFilterChain` bean (no more `WebSecurityConfigurerAdapter`)
- **Validation** — `@Valid` + `jakarta.validation` annotations on DTOs
- **Dependency Injection** — constructor injection preferred (no `@Autowired` needed)
- **GraalVM Native** — `mvn -Pnative native:compile` for instant startup
- **Structured Concurrency** — `StructuredTaskScope` for managing concurrent tasks
- **Profiles** — `application-dev.yml`, `application-prod.yml` for config

## Common Patterns
```java
@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public Page<UserDto> list(Pageable pageable) {
        return userService.findAll(pageable);
    }

    @PostMapping
    public ResponseEntity<UserDto> create(@Valid @RequestBody CreateUserDto dto) {
        return ResponseEntity.status(201).body(userService.create(dto));
    }
}
```

## Gotchas
- Use constructor injection, not field `@Autowired` — easier to test
- N+1 queries with JPA — use `@EntityGraph` or `JOIN FETCH` in JPQL
- `@Transactional` only works on public methods called from outside the class
- Virtual threads: avoid `synchronized` blocks with I/O — use `ReentrantLock` instead
- Always use `Optional` return from repositories — never return `null`

## Security
- Use Spring Security `SecurityFilterChain` — enable CSRF for session-based auth, disable only for stateless JWT APIs
- Validate all DTOs with `@Valid` + `jakarta.validation` — reject malformed input at controller level
- Use parameterized queries (JPA/JPQL) — never concatenate user input into native SQL
- Run OWASP Dependency-Check or Snyk in CI to detect known CVEs in dependencies
- Always use latest stable Spring Boot version — run `mvn dependency:analyze` before deploy

## References
- https://spring.io/projects/spring-boot
- https://docs.spring.io/spring-security/reference/
- https://docs.oracle.com/en/java/javase/21/
