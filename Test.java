import java.util.stream.*;

class Test {
    public static void main(String[] args) {
        System.out.println("java test");
        Stream.of(args).forEach(System.out::println);
    }
}