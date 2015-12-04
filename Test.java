/***
["org.glassfish.jersey.core:jersey-client:2.22.1"]
*/

import java.util.stream.*;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.ClientBuilder;

class Test {
    public static void main(String[] args) {
        Stream.of(args).forEach(System.out::println);

        Client client = ClientBuilder.newClient();
        String response = client.target("https://api.github.com/zen").request().get(String.class);
        System.out.println(response);
    }
}