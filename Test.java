/***
["org.glassfish.jersey.core:jersey-client:2.22.1"]
*/

import java.util.stream.*;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;
import java.io.File;

class Test {
    public static void main(String[] args) {
        // check args
        Stream.of(args).forEach(System.out::println);

        // check .
        Stream.of(new File(".").list()).forEach(System.out::println);

        // check external libs
        Client client = ClientBuilder.newClient();
        String response = client.target("https://api.github.com/zen").request().get(String.class);
        System.out.println(response);
    }
}
