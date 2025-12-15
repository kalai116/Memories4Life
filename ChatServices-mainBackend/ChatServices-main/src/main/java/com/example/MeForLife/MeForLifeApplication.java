package com.example.MeForLife;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// --------------------------------------------------------Main Class--------------------------------------------------------------

// springbootapplication annotation is a meta annotation in Spring boot that combines many impt annotation  
// @Configuration - A class for defining beans 
// @EnableAutoConfiguration - auto configures beans based on the dependencies present on the classpath 
// @ComponentScan Enable scanning for Spring component @Controller, @Service, @Reposotory and @Component within the package 
@SpringBootApplication
public class MeForLifeApplication {

	public static void main(String[] args) {
		// Starts the Spring app using the ,run i passed in the main class to boot 
		SpringApplication.run(MeForLifeApplication.class, args);
	}

}
