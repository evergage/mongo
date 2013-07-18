
t = db.update_funcMulti;

t.drop()

t.insert({path: 'r1', actions: 3, subscribers: [1,2]});
t.insert({path: 'r2', actions: 4, computed: 0, subscribers: [3,4]});
t.insert({path: 'r3', actions: 5, computed: 0, subscribers: [3,4,5]}); // in place update

t.update({}, {
	$addToSet: {subscribers: 5},
	$set: {
		computed: function(){ return {value: Math.pow( 2, this.actions )}}
	}
}, { upsert: false, multi: true});

t.find().forEach(
    function(z){
        assert.eq( 3 , z.subscribers.length , z );
        assert.eq( z.computed, Math.pow( 2, z.actions ) , z );
    }
);


