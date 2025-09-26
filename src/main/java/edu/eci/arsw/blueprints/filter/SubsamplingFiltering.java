package edu.eci.arsw.blueprints.filter;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Primary
public class SubsamplingFiltering implements Filter {
    
    @Override
    public Blueprint filter(Blueprint bp) {
        if (bp == null || bp.getPoints() == null || bp.getPoints().isEmpty()) {
            return bp;
        }
        
        List<Point> originalPoints = bp.getPoints();
        List<Point> filteredPoints = new ArrayList<>();

        for (int i = 0; i < originalPoints.size(); i += 2) {
            filteredPoints.add(originalPoints.get(i));
        }
        
        bp.setPoints(filteredPoints);
        return bp;
    }
}
