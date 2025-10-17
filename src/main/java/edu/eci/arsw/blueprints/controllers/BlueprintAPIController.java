/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.controllers;

import java.util.Set;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.services.BlueprintsServices;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.logging.Level;
import java.util.logging.Logger;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PutMapping;

/**
 *
 * @author hcadavid
 */

@RestController
@CrossOrigin(origins = "*")
@RequestMapping(value = "/blueprints", produces = MediaType.APPLICATION_JSON_VALUE)
public class BlueprintAPIController {

    @Autowired
    private BlueprintsServices blueprintsServices;

    @GetMapping
    public ResponseEntity<?> getAllBlueprints() {
        try {
            Set<Blueprint> data = blueprintsServices.getAllBlueprints();
            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{author}")
    public ResponseEntity<?> getBlueprintsbyAuthor(@PathVariable("author") String author) {
        try {
            Set<Blueprint> data = blueprintsServices.getBlueprintsByAuthor(author);
            if (data == null || data.isEmpty()) {
                return new ResponseEntity<>("No se encontraron planos para: " + author, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
        }
    }

    @GetMapping("/{author}/{name}")
    public ResponseEntity<?> getBlueprints(@PathVariable("author") String author,@PathVariable("name") String name) {
        try {
            Blueprint data = blueprintsServices.getBlueprint(author, name);
            if (data == null ) {
                return new ResponseEntity<>("No se encontraron planos para: " + author, HttpStatus.NOT_FOUND);
            }
            return new ResponseEntity<>(data, HttpStatus.OK);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", ex.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> postBlueprint(@RequestBody Blueprint blueprint){
        try {
            blueprintsServices.addNewBlueprint(blueprint);
            return new ResponseEntity<>(HttpStatus.CREATED);
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("error", ex.getMessage()));
        }

    }

    @PutMapping("/{author}/{name}")
    public ResponseEntity<?> updateBlueprint(
            @PathVariable("author") String author,
            @PathVariable("name") String name, 
            @RequestBody Blueprint blueprint) {
        try {
            // Verificar que el autor y nombre en la URL coincidan con los del blueprint
            if (!blueprint.getAuthor().equals(author) || !blueprint.getName().equals(name)) {
                return new ResponseEntity<>("La URL y los datos del plano no coinciden", HttpStatus.BAD_REQUEST);
            }

            // Actualizar los puntos del blueprint
            blueprintsServices.updatePoints(author, name, blueprint);
            return new ResponseEntity<>(HttpStatus.OK);
            
        } catch (Exception ex) {
            Logger.getLogger(BlueprintAPIController.class.getName()).log(Level.SEVERE, null, ex);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
        }
    }



}
