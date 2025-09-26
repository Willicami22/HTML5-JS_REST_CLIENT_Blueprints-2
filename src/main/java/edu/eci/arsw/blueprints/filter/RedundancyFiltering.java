package edu.eci.arsw.blueprints.filter;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.filter.Filter;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;


@Service
public class RedundancyFiltering implements Filter {
    private List<Point> points;

    @Override
    public Blueprint filter(Blueprint bp) {
        if (bp == null || bp.getPoints() == null || bp.getPoints().isEmpty()) {
            return bp;
        }

        List<Point> originalPoints = bp.getPoints();
        List<Point> filteredPoints = new ArrayList<>();

        filteredPoints.add(originalPoints.get(0));

        for (int i = 1; i < originalPoints.size(); i++) {
            Point current = originalPoints.get(i);
            Point lastAdded = filteredPoints.get(filteredPoints.size() - 1);

            if (!(current.getX() == lastAdded.getX() && current.getY() == lastAdded.getY())) {
                filteredPoints.add(current);
            }
        }

        bp.setPoints(filteredPoints);
        return bp;
    }
}
