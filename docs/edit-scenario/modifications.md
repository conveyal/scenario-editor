# Modification types

At the top of the modification details panel, there are multiple actions for each modification, including:
<br><span class="ui-icon"><i class="fa fa-pencil"></i>Rename</span>
<br><span class="ui-icon"><i class="fa fa-copy"></i>Copy</span>
<br><span class="ui-icon"><i class="fa fa-trash"></i>Delete</span>
<br><span class="ui-icon"><i class="fa fa-square"></i>Fit map to modification extents</span>

Clicking the small blue back arrow saves your changes and take you back to the list of all modifications:
<br><span class="ui-icon"><i class="fa fa-chevron-left"></i>Modifications</span>

Changes are also automatically saved every 10 seconds. Each type of modification has additional options available, as detailed below.

## Add trips

The add trips modification allows you to add new [trip patterns](../glossary.html#trip-pattern) to your transport scenario. After creating the modification you will see this view:

<figure>
<img src="../img/new-add-trip-pattern.png" alt="a new add trips modification" />
</figure>

You can set the mode (e.g. bus) and other route information at the top of the panel. The name and color of the modification can be exported to other tools (e.g. using Taui to publish [interactive accessibility sites](https://blog.conveyal.com/shaping-conversations-about-transit-with-interactive-isochrone-mapping-1d6530d6a8a4)).

To create an alignment for the modification (or to edit the alignment you've previously created), click
<br><span class="btn btn-warning"><i class="fa fa-pencil"></i> Edit route geometry</span>

This will activate editing mode. In editing mode, click once on the map to place the first stop, then again to place the second stop, and so on. If you click on an existing stop (indicated by a small gray circle), the icon for the new stop will be black and the new transit service will stop at that existing stop. If you click in a place where there is not an existing stop, a new stop (in blue) will be created.

To insert a stop into the middle of an alignment, click any part of the alignment. Once created, any stop can be dragged to move it. Clicking on a stop gives you the option to delete it, or convert it to a _control point_ through which the route will pass without stopping. Similarly, control points can be converted back to stops or deleted by clicking on them. It's important to get the alignment approximately correct so that the length of each segment is correct when used to calculate the travel times between stops.

<figure>
<img src="../img/make-stop.png" alt="make a new stop" />
</figure>

Available options while editing an alignment include:

- **Auto-create stops at set spacing**: Whether stops should be created automatically at a specified interval along the route.
- **Bidirectional**: If this checkbox is checked, vehicles will travel in both directions along the described geometry. If it is left unchecked, vehicles will only travel in the direction the line is drawn (which can be useful when there are couplets or other aspects of the route that don't follow the same alignment in both directions). You can choose whether stops should be created automatically at a specified interval along the route, or if you will create all stops manually.
- **Follow streets**: Make the route follow the streets. This only applies to segments that are actively being edited, and will not cause already drawn segments to follow the streets, allowing you to draw part of a route on street and part off-street.
- **Extend**: If this checkbox is checked, clicking on the map will extend the route by adding a new stop. If you wish to edit segments you already created, by adding stops or control points, it is often convenient to uncheck this option so that stray clicks do not extend the route from one if its termini.
- **Extend from end**: When "Extend" is enabled, this option allows you to specify whether new stops will be added moving forward from the last stop of the route or backward from the first stop of the route.

Once you have created an alignment, you need to specify when the routes run using a [simplified timetable](timetable.html). You can do this by [copying a previously created timetable](timetable.html#copying-timetables), or by clicking:
<br><span class="btn btn-success"><i class="fa fa-plus"></i> Add timetable</span>

## Adjust dwell time

You may also want to adjust the dwell time along a route or at a particular stop, for example to model the effects of off-board fare collection, or the effects of increasing ridership at a particular stop. As with the remove-stops modification, you can select a feed, route and optionally patterns. You can then use the map to select the affected stops (if you skip this step, all stops will have their dwell times adjusted). You can then choose to either enter a new dwell time (in seconds), or scale the existing dwell times (for instance, entering 2 would double exiting dwell times).

Unfortunately, the stop_times.txt files of many GTFS feeds use equal arrival_time and departure_time values. For such feeds that do not represent dwell time explicitly, this modification type may not be immediately applicable.

<figure>
<img src="../img/adjust-dwell-time.png" alt="Adjusting the dwell time at particular stops on a route" />
</figure>

## Adjust frequency

Often a scenario will include frequency changes to existing lines. We support this using the adjust frequency/convert to frequency modification. First, create a "convert to frequency" modification, and choose the feed and route you want to adjust:

<figure>
<img src="../img/new-change-frequency.png" alt="Selecting the route on which to change frequencies" />
</figure>

You then create any number of frequency entries using [simple timetables](timetable.html). Typically, there will be at least two entries (one for each direction). Each frequency entry will follow one template trip, which determines the stop-to-stop travel times of the trips that are created with the given frequency.

You then [add details to each frequency entry](timetable.html). Repeat this process until you have created frequency entries for all the service you want to retain, in both directions.

You can choose to remove all existing trips on the route (the default) or choose to retain trips outside the time windows in which you specify frequencies, which is useful when you are changing the frequency for only part of the day (e.g. increased weekend frequency) and want to retain the existing scheduled service at other times. This is controlled using the "Retain existing scheduled trips at times without new frequencies specified" checkbox.

## Adjust speed

Sometimes you will want to adjust the speed on a route, or a portion of it (for instance due to the addition of dedicated bus lanes, or an application of transit signal priority). As before, you will create the modification and select a feed, routes and patterns. If you want to modify only part of the route, you can use similar selection tools to those used in the remove stops (with new selection, add and remove buttons). The difference is that you are now selecting [hops](../glossary.html#hops). The selected segment will be shown on the map in purple. Finally, enter a scale, which is the factor to multiply the speed by. For instance, if you enter 2, vehicles will travel twice as fast between stops (this modification does not affect dwell times; to model changes in dwell time, see the adjust dwell time modification below).

This modification does not take into account the possibility of increased frequency due to more efficient routes. However, it can be paired with a change frequency modification to model that scenario.

<figure>
<img src="../img/adjust-speed.png" alt="Adjusting the speed of a portion of a transit line" />
</figure>

## Remove stops

It is also possible to remove some of the stops from a route, while leaving the rest of the route untouched. To do this, create a new Remove Stops modification, and select a feed, route, and patterns as you did when removing trips. You can then use the map to select which stops to remove. Under "Selection," click "new", "add to," or "remove from" to select new stops to remove, add to the existing selection, or remove from the existing selection. Stops that are selected for removal are listed at the bottom of the modification, as well as being highlighted in red on the map.

You can also specify that you wish to remove a certain amount of time at each removed stop (in addition to the dwell time specified in the original feed, which is automatically removed). This could be used to account for acceleration and deceleration, and can also be used when the original feed does not specify dwell time. This feature is useful when testing the effects of stop consolidation.

When removing the beginning of a route, the dwell times at each stop are removed, as is any time specified to be removed at each removed stop. Any remaining travel time is preserved as an offset from the start of the trip in the original GTFS to the start of trips at the new first stop. This is effectively as if the vehicles were leaving the original terminal at the same time but deadheading past all of the removed stops.

This modification does not take into account the possibility of increased frequency due to more efficient routes. However, it can be paired with a change frequency modification to model that scenario.

<figure>
<img src="../img/remove-stops.png"  alt="Remove stops" />
</figure>

## Remove trips

Another common modification is to remove trips. The most common use is to remove entire routes, but it is also possible to remove only specific patterns on a particular routes.
In order to remove trips, create a new Remove Trips modification, and select a GTFS feed, route, and optionally the trip pattern of the trips to be removed. All trips on this
route/pattern combination will be removed, and the route will be shown in red on the map. Note that the "active in variants" selector always specifies whether the modification is active,
so in this case implies that the trips will be removed from the selected variants.

<figure>
<img src="../img/remove-trips.png" alt="Remove trips" />
</figure>

## Reroute

This modification type can be used to represent detours and extensions. When creating a Reroute modification, you specify first select a feed, route, and patterns. Once patterns are selected, you then select a stop at which the reroute segments will start, or a stop at which the reroute segments will end, or both, by clicking
<br><span class="btn btn-info"><i class="fa fa-crosshairs"></i> Select</span>
<br> then clicking an existing stop on the baseline pattern.

<figure>
<img src="../img/reroute.png" alt="Rerouting" />
</figure>

Once a start or end stop is specified, you can add and modify segments by clicking
<br><span class="btn btn-warning"><i class="fa fa-pencil"></i> Edit route geometry</span>
<br> then clicking on the map. Editing behavior is similar to editing mode for [adding trip patterns](#add-trips), with some options fixed:

- If only the "start of reroute/extension" is set, new stops and segments will be added extending _forward_ from the selected stop on the baseline pattern ("Extend from end" turned on).
- If only the "end of reroute/extension" is set, new stops and segments will be added extending _backward_ from the selected stop on the baseline pattern ("Extend from end" turned off).
- If both are set, the new segment between the stops cannot be extended, but it can be modified by clicking on it to add stops and control points ("Extend" turned off).

For example, consider a baseline pattern passing through stops A -> B -> C -> D:

- To reroute this pattern from C to another stop X instead of D, select C as the "start of reroute/extension," activate route editing, and click on stop X to add a segment from C -> X. Speeds and dwell times can be set on this added segment. Baseline speeds and dwell times between A and C are not affected.
- To extend this pattern backward, to originate at a stop Y, select A as the "end of reroute/extension," activate route editing, and click on stop Y to add a segment from Y -> A. Speeds and dwell times can be set on this new segment. Baseline speeds and dwell times between A and D are not affected.
- To detour this pattern so that it serves a stop Z between B and C, select B as the "start of reroute/extension", select C as the "end of reroute/extension", activate route editing, click on the new segment to add a stop, and drag the added stop to Z. Speeds and dwell times can be set on this new segment. Baseline speeds and dwell times between A and B, and between C and D, are not affected.

A reroute modification can apply to multiple patterns in a single direction as long as the patterns all contain the start and end stop in order; you will generally need to create one reroute modification for each direction of the route.
