/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.persistence.impl;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.stream.Collectors;

/**
 *
 * @author hcadavid
 */
@Service
public class InMemoryBlueprintPersistence implements BlueprintsPersistence {

    private final ConcurrentMap<Tuple<String,String>, Blueprint> blueprints = new ConcurrentHashMap<>();
    private final Map<Tuple<String,String>, Object> locks = new ConcurrentHashMap<>();


    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        Tuple<String, String> key = new Tuple<>(bp.getAuthor(), bp.getName());
        Object lock = locks.computeIfAbsent(key, k -> new Object());

        synchronized (lock) {
            if (blueprints.containsKey(key)) {
                throw new BlueprintPersistenceException("The given blueprint already exists: " + bp);
            }
            blueprints.put(key, bp);
        }
    }

    @Override
    public void updateBlueprint(Blueprint bp) throws BlueprintPersistenceException, BlueprintNotFoundException {
        Tuple<String, String> key = new Tuple<>(bp.getAuthor(), bp.getName());
        Object lock = locks.computeIfAbsent(key, k -> new Object());

        synchronized (lock) {
            Blueprint existing = blueprints.get(key);
            if (existing == null) {
                throw new BlueprintNotFoundException("The blueprint doesn't exist: " + bp.getAuthor() + "/" + bp.getName());
            }
            blueprints.put(key, bp);
        }
    }

    @Override
    public Blueprint getBlueprint(String author, String bprintname) {
        Tuple<String, String> key = new Tuple<>(author, bprintname);
        return blueprints.get(key);
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) {
        return blueprints.values().stream()
                .filter(bp -> bp.getAuthor().equals(author))
                .collect(Collectors.toSet());
    }

    @Override
    public Set<Blueprint> getAllBlueprints() {
        return new HashSet<>(blueprints.values());
    }
}

