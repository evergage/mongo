// SERVER-14876: support $elemMatch in aggregation $project operator

c = db.c;
c.drop();

c.save({
  _id: 123,
  a: 'foo',
  b: [{
    c: 'bar'
  }, {
    c: 'foo'
  }, {
    c: 'baz'
  }],
  c: ['bar', 'baz', 'foo'],
  i: [{
    j: 5,
    x: 'a'
  }, {
    j: 10,
    x: 'b'
  }, {
    j: 15,
    x: 'c'
  }, {
    j: 20,
    x: 'd'
  }],
  k: [5, 10, 15, 20],
  subObj: {
    b: [{
      c: 'barSub'
    }, {
      c: 'fooSub'
    }, {
      c: 'bazSub'
    }]
  },
});

jsTest.log("Testing basic object in array match");

res = c.aggregate({
  $project: {
    projectedB: {
      $elemMatch: {
        "$b": {
          c: 'baz'
        }
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  projectedB: {
    c: 'baz'
  }
});

jsTest.log("Testing basic object in array match, dereference dotted subfield");

res = c.aggregate({
  $project: {
    projectedSubObj: {
      $elemMatch: {
        "$subObj.b": {
          c: 'bazSub'
        }
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  projectedSubObj: {
    c: 'bazSub'
  }
});

jsTest.log("Testing basic object in array, reference same array multiple times");

res = c.aggregate({
  $project: {
    projectedBaz: {
      $elemMatch: {
        "$b": {
          c: 'baz'
        }
      }
    },
    projectedBar: {
      $elemMatch: {
        "$b": {
          c: 'bar'
        }
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  projectedBaz: {
    c: 'baz'
  },
  projectedBar: {
    c: 'bar'
  }
});


jsTest.log("Testing basic object in array match, same field name");

res = c.aggregate({
  $project: {
    b: {
      $elemMatch: {
        "$b": {
          c: 'baz'
        }
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  b: {
    c: 'baz'
  }
});

jsTest.log("Testing matching an array of primitives using an object match condition");

res = c.aggregate({
  $project: {
    c: {
      $elemMatch: {
        "$c": {
          $in: ['aaz', 'baz']
        }
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  c: 'baz'
});

jsTest.log("Testing matching an array of primitives using a complex numeric match condition");

res = c.aggregate({
  $project: {
    k: {
      $elemMatch: {
        "$k": {
          $gte: 15,
          $lt: 20
        }
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  k: 15
});

jsTest.log("Testing matching an array of primitives using a primitive condition");

res = c.aggregate({
  $project: {
    c: {
      $elemMatch: {
        "$c": 'baz'
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  c: 'baz'
});


jsTest.log("Testing matching an object using a complex $and condition");

res = c.aggregate({
  $project: {
    i: {
      $elemMatch: {
        "$i": {
          j: {
            $gte: 10,
            $lt: 20
          }
        }
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123,
  i: {
    j: 10,
    x: 'b'
  }
});

jsTest.log("Testing matching against a non-array field yields no results");

res = c.aggregate({
  $project: {
    projectedA: {
      $elemMatch: {
        "$a": 'foo'
      }
    }
  }
});

assert.eq(res.result[0], {
  _id: 123
});

jsTest.log("Testing matching an object using test case from SERVER-14876");

c.drop();
c.insert({
  'people': [{
    'a': 'president',
    'name': 'bob'
  }, {
    'a': 'vice president',
    'name': 'fred'
  }, {
    'a': 'secretary',
    'name': 'john'
  }]
});
c.insert({
  'people': [{
    'a': 'president',
    'name': 'frank'
  }, {
    'a': 'vice president',
    'name': 'joe'
  }, {
    'a': 'secretary',
    'name': 'edna'
  }]
});
c.insert({
  'people': [{
    'a': 'president',
    'name': 'frank'
  }, {
    'a': 'vice president',
    'name': 'joe'
  }, {
    'a': 'secretary',
    'name': 'edna'
  }]
});
c.insert({
  'people': [{
    'a': 'president',
    'name': 'frank'
  }, {
    'a': 'vice president',
    'name': 'joe'
  }, {
    'a': 'secretary',
    'name': 'edna'
  }]
});

res = c.aggregate([
  {
    '$project': {
      'vice_president': {
        '$elemMatch': {
          '$people': {
            'a': 'vice president'
          }
        }
      }
    }
    },
  {
    '$group': {
      '_id': '$vice_president.name',
      'records': {
        $sum: 1
      }
    }
    },
  {
    '$sort': {
      _id: 1
    }
    }
]);

assert.eq(res.result, [{
  _id: 'fred',
  records: 1
}, {
  _id: 'joe',
  records: 3
}]);
