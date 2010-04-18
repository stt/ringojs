package org.ringojs.util;

import java.util.TimeZone;
import java.text.SimpleDateFormat;

public class DateUtils {

    /**
     * Wrap TimeZone.getTimeZone so that reflection doesn't need to look for
     * sun.util.calendar.ZoneInfo which causes warnings in some environments
     */
    public static void resolveTimeZone(SimpleDateFormat sdf, String timezone) {
        sdf.setTimeZone( TimeZone.getTimeZone(timezone) );
    }
    
}

