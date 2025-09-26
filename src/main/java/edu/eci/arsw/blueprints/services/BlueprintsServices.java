/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.services;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;
import edu.eci.arsw.blueprints.persistence.impl.InMemoryBlueprintPersistence;
import edu.eci.arsw.blueprints.filter.Filter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Set;

/**
 *
 * @author hcadavid
 */
@Service
public class BlueprintsServices {
   
    @Autowired
    BlueprintsPersistence bpp = new InMemoryBlueprintPersistence();

    @Autowired
    Filter filter;
    
    public void addNewBlueprint(Blueprint bp) throws BlueprintPersistenceException {
       try {
           bpp.saveBlueprint(bp);
       }
       catch (BlueprintPersistenceException e){
           throw new BlueprintPersistenceException("Blueprint persistence error");
       }
    }
    
    public Set<Blueprint> getAllBlueprints() throws BlueprintNotFoundException {
        try {
            for(Blueprint bp : bpp.getAllBlueprints()){
                filter.filter(bp);
            }
            return bpp.getAllBlueprints();
        }
        catch (BlueprintNotFoundException e){
            throw new BlueprintNotFoundException("Blueprint not found");
        }
    }
    
    /**
     * 
     * @param author blueprint's author
     * @param name blueprint's name
     * @return the blueprint of the given name created by the given author
     * @throws BlueprintNotFoundException if there is no such blueprint
     */
    public Blueprint getBlueprint(String author,String name) throws BlueprintNotFoundException{
        try{
            return filter.filter(bpp.getBlueprint(author, name));
        }
        catch (BlueprintNotFoundException e){
            throw new BlueprintNotFoundException("Blueprint not found");
        }
    }
    
    /**
     * 
     * @param author blueprint's author
     * @return all the blueprints of the given author
     * @throws BlueprintNotFoundException if the given author doesn't exist
     */
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException{
        try{
            for(Blueprint bp : bpp.getBlueprintsByAuthor(author)){
                filter.filter(bp);
            }
            return bpp.getBlueprintsByAuthor(author);
        }
        catch (BlueprintNotFoundException e){
            throw new BlueprintNotFoundException("Blueprint not found");
        }
    }

    public void updatePoints(String author, String name, Blueprint bp) throws BlueprintPersistenceException, BlueprintNotFoundException {
        try {
            Blueprint existingBp = bpp.getBlueprint(author, name);

            existingBp.setPoints(bp.getPoints());
            bpp.updateBlueprint(existingBp);
        } catch (BlueprintNotFoundException e) {
            throw new BlueprintNotFoundException("Blueprint no encontrado: " + author + "/" + name);
        } catch (Exception e) {
            throw new BlueprintPersistenceException("Error al actualizar el blueprint: " + e.getMessage());
        }
    }
}
